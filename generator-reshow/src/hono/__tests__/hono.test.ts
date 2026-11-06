/**
 * https://yeoman.io/authoring/testing.html
 * https://gilsondev.gitbooks.io/yeoman-authoring/content/authoring/unit_testing.html
 *
 * https://github.com/yeoman/yeoman-assert/blob/main/index.js
 * https://github.com/yeoman/yeoman-test/blob/main/lib/run-context.js
 */

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { YoTest, assert } from "yo-unit";

const HONO_SOURCE = import.meta.dirname + "/../../../generators/hono";

const params = {
  isReady: true,
  description: "foo-desc",
  keyword: "foo-keyword",
  repositoryName: "foo-repository-name",
  repositoryOrgName: "foo-repository-org-name",
};

const readTsconfig = (runResult: any) =>
  JSON.parse(
    readFileSync(
      join(runResult.targetDirectory || process.cwd(), "tsconfig.json"),
      "utf-8"
    )
  );

const reactJsxPaths = {
  react: ["./node_modules/hono/dist/types/jsx/dom/index.d.ts"],
  "react/jsx-runtime": [
    "./node_modules/hono/dist/types/jsx/dom/jsx-runtime.d.ts",
  ],
  "react/jsx-dev-runtime": [
    "./node_modules/hono/dist/types/jsx/dom/jsx-dev-runtime.d.ts",
  ],
  "react-dom": ["./node_modules/hono/dist/types/jsx/dom/index.d.ts"],
  "react-dom/client": ["./node_modules/hono/dist/types/jsx/dom/client.d.ts"],
};

describe("!! hono !!", () => {
  let runResult: any;

  beforeAll(async () => {
    runResult = await YoTest({ source: HONO_SOURCE, params });
  });

  afterAll(() => {
    if (runResult) {
      runResult.restore();
    }
  });

  it("should have folder", () => {
    assert.file(["src"]);
  });

  it("should have file", () => {
    assert.file([
      "src/runner/server.ts",
      "src/cli.ts",
      "src/build.ts",
      "src/runner/client.tsx",
      "tsconfig.json",
    ]);
  });

  it("should have content", () => {
    assert.fileContent("src/runner/server.ts", "Hono");
    assert.fileContent("package.json", "hono");
    assert.fileContent("package.json", "foo-desc");
  });

  it("should map react imports to hono jsx dom types", () => {
    const tsconfig = readTsconfig(runResult);
    expect(tsconfig.compilerOptions.jsx).toBe("react-jsx");
    expect(tsconfig.compilerOptions.jsxImportSource).toBe("react");
    expect(tsconfig.compilerOptions.paths).toEqual(reactJsxPaths);
    expect(tsconfig.compilerOptions.lib).toContain("DOM");
    expect(tsconfig.compilerOptions.lib).toContain("DOM.Iterable");
  });

  it("should alias react imports to hono jsx dom in the client build", () => {
    assert.fileContent("src/build.ts", 'react: "hono/jsx/dom"');
    assert.fileContent(
      "src/build.ts",
      '"react/jsx-runtime": "hono/jsx/dom/jsx-runtime"'
    );
    assert.fileContent(
      "src/build.ts",
      '"react/jsx-dev-runtime": "hono/jsx/dom/jsx-dev-runtime"'
    );
    assert.fileContent("src/build.ts", '"react-dom": "hono/jsx/dom"');
    assert.fileContent(
      "src/build.ts",
      '"react-dom/client": "hono/jsx/dom/client"'
    );
    assert.fileContent("src/runner/client.tsx", 'from "react-dom/client"');
    assert.fileContent("src/runner/client.tsx", 'from "react"');
    assert.fileContent(
      "package.json",
      '"build:client": "bun run src/build.ts"'
    );
    assert.fileContent(
      "package.json",
      "bun build:types && bun build:client"
    );
  });
});

describe("!! hono (existing tsconfig) !!", () => {
  let runResult: any;

  beforeAll(async () => {
    runResult = await YoTest({
      source: HONO_SOURCE,
      params,
      setupTmpDir: (dir: string) => {
        writeFileSync(
          join(dir, "tsconfig.json"),
          JSON.stringify(
            {
              compilerOptions: {
                target: "ES2020",
                jsx: "preserve",
                paths: {
                  react: ["custom/react.d.ts"],
                  "#alias": ["./src/*"],
                },
                lib: ["ES2020"],
              },
            },
            null,
            2
          )
        );
        mkdirSync(join(dir, "src"), { recursive: true });
        writeFileSync(join(dir, "src/build.ts"), "// custom build\n");
      },
    });
  });

  afterAll(() => {
    if (runResult) {
      runResult.restore();
    }
  });

  it("should keep existing settings and only fill missing aliases", () => {
    const { compilerOptions } = readTsconfig(runResult);
    expect(compilerOptions.target).toBe("ES2020");
    expect(compilerOptions.jsx).toBe("preserve");
    expect(compilerOptions.jsxImportSource).toBe("react");
    expect(compilerOptions.paths["#alias"]).toEqual(["./src/*"]);
    expect(compilerOptions.paths.react).toEqual(["custom/react.d.ts"]);
    expect(compilerOptions.paths["react-dom/client"]).toEqual(
      reactJsxPaths["react-dom/client"]
    );
    expect(compilerOptions.lib).toEqual(["ES2020", "DOM", "DOM.Iterable"]);
  });

  it("should not overwrite an existing build script", () => {
    assert.fileContent("src/build.ts", "// custom build");
    assert.noFileContent("src/build.ts", "reactToHono");
  });
});
