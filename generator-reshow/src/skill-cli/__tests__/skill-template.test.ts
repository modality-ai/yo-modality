/**
 * Guards the SKILL.mdx scaffold template against schema drift.
 *
 * bunfig.toml ignores the templates glob, so the template's own test only runs
 * inside a *generated* project — never in this repo's CI. This suite renders
 * the template here (mimicking copyTpl's ejs `<%= %>` escaping) and runs the
 * same `setupSingleMethodValidation` gate the generated project runs, so a
 * template regression fails this repo's `npm test` instead of every scaffold.
 */

import { describe, it, expect, afterAll } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { setupSingleMethodValidation } from "@modality-counter/core";

const templatePath = join(import.meta.dir, "../templates/src/SKILL.mdx");

/** Mirror ejs `<%=` escaping — what copyTpl writes into generated projects. */
const ejsEscape = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      (
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&#34;",
          "'": "&#39;",
        } as Record<string, string>
      )[c] ?? c
  );

const render = (vars: Record<string, string>): string =>
  readFileSync(templatePath, "utf8").replace(
    /<%=\s*(\w+)\s*%>/g,
    (_m, key: string) => ejsEscape(vars[key] ?? "")
  );

// Render into a repo-local temp dir: the MDX validator bundles
// react/jsx-runtime, which must resolve through this repo's node_modules.
const outDir = mkdtempSync(join(import.meta.dir, ".render-"));

afterAll(() => {
  rmSync(outDir, { recursive: true, force: true });
});

// Plain description — the happy path every scaffold hits.
const plainPath = join(outDir, "SKILL.mdx");
writeFileSync(
  plainPath,
  render({ mainName: "my-cli", description: "Does a thing" })
);

// Hostile description — colon-space breaks unescaped YAML scalars,
// quotes/angle brackets only survive via ejs escaping.
const hostilePath = join(outDir, "SKILL-hostile.mdx");
writeFileSync(
  hostilePath,
  render({
    mainName: "my-cli",
    description: 'Foo: he said "hi" & <bye>',
  })
);

// Must run at top level — registers describe/test blocks on import.
setupSingleMethodValidation(plainPath);
setupSingleMethodValidation(hostilePath);

describe("SKILL.mdx template rendering", () => {
  it("leaves no unrendered EJS placeholders", () => {
    for (const p of [plainPath, hostilePath]) {
      expect(readFileSync(p, "utf8")).not.toContain("<%=");
    }
  });

  it("quotes description in frontmatter and method.introduce", () => {
    const out = readFileSync(plainPath, "utf8");
    expect(out).toContain('description: "Does a thing"');
    expect(out).toContain('introduce: "Does a thing"');
  });

  it("survives colon-bearing descriptions after render", () => {
    const out = readFileSync(hostilePath, "utf8");
    expect(out).toContain('description: "Foo: he said &#34;hi&#34;');
  });
});
