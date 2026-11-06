#!/usr/bin/env bun
import { existsSync } from "fs";
import { join } from "path";

const rootDir = join(import.meta.dir, "..");

/**
 * React-compatible imports → hono/jsx/dom modules.
 *
 * tsconfig `paths` only aliases the type checker (Bun's bundler ignores
 * paths that point at `.d.ts`), so the browser bundle needs a real alias.
 */
export const reactAliases: Record<string, string> = {
  react: "hono/jsx/dom",
  "react/jsx-runtime": "hono/jsx/dom/jsx-runtime",
  "react/jsx-dev-runtime": "hono/jsx/dom/jsx-dev-runtime",
  "react-dom": "hono/jsx/dom",
  "react-dom/client": "hono/jsx/dom/client",
};

/**
 * Bun plugin that resolves React imports to hono/jsx/dom.
 */
export const reactToHono = (resolveFrom: string): Bun.BunPlugin => ({
  name: "react-to-hono-jsx",
  setup(build) {
    build.onResolve({ filter: /^react(-dom)?(\/.*)?$/ }, (args) => {
      const target = reactAliases[args.path];
      return target
        ? { path: Bun.resolveSync(target, resolveFrom) }
        : undefined;
    });
  },
});

export const buildClient = async (entrypoints: string[] = []) => {
  const entries = entrypoints.length
    ? entrypoints
    : [join(import.meta.dir, "runner", "client.tsx")];

  const missing = entries.filter((entry) => !existsSync(entry));
  if (missing.length) {
    console.log(`Skip client build, entry not found: ${missing.join(", ")}`);
    return;
  }

  const result = await Bun.build({
    entrypoints: entries,
    outdir: join(rootDir, "public/static"),
    naming: "client.js",
    target: "browser",
    minify: true,
    plugins: [reactToHono(rootDir)],
    define: { "process.env.NODE_ENV": '"production"' },
  });

  if (!result.success) {
    console.error("Client build failed:");
    result.logs.forEach((log) => console.error(log));
    process.exitCode = 1;
    return;
  }

  console.log(`Client bundle: ${join(rootDir, "public/static/client.js")}`);
};

if (import.meta.main) {
  await buildClient(process.argv.slice(2));
}
