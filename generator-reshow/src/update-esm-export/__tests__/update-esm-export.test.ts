/**
 * https://yeoman.io/authoring/testing.html
 * https://gilsondev.gitbooks.io/yeoman-authoring/content/authoring/unit_testing.html
 *
 * https://github.com/yeoman/yeoman-assert/blob/main/index.js
 * https://github.com/yeoman/yeoman-test/blob/main/lib/run-context.js
 */

import { describe, it, beforeAll, afterAll } from "bun:test";
import { copyFileSync } from "fs";
import { join } from "path";
import { YoTest, assert } from "yo-unit";

describe("!! update-esm-export !!", () => {
  let runResult: any;

  beforeAll(async () => {
    runResult = await YoTest({
      source: import.meta.dirname + "/../../../generators/update-esm-export/.",
      params: {
        isReady: true,
        description: "foo-desc",
        keyword: "foo-keyword",
      },
      setupTmpDir: (dir: string) => {
        copyFileSync(join(import.meta.dirname, ".yo"), join(dir, ".yo"));
        copyFileSync(
          join(import.meta.dirname, "package.json"),
          join(dir, "package.json")
        );
      },
    });
  });

  afterAll(() => {
    if (runResult) {
      runResult.restore();
    }
  });

  it("should have folder", () => {
    //    assert.file(["src", "ui"]);
  });

  it("should have file", () => {
    assert.file(["package.json"]);
  });

  it("should have content", () => {
    assert.fileContent("package.json", '".": "./dist/index.js"');
  });
});
