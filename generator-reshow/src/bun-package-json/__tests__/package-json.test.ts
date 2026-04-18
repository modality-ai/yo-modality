/**
 * https://yeoman.io/authoring/testing.html
 * https://gilsondev.gitbooks.io/yeoman-authoring/content/authoring/unit_testing.html
 *
 * https://github.com/yeoman/yeoman-assert/blob/main/index.js
 * https://github.com/yeoman/yeoman-test/blob/main/lib/run-context.js
 */

import { describe, it, beforeAll, afterAll } from "bun:test";
import { YoTest, assert } from "yo-unit";

describe("!! package-json !!", () => {
  let runResult: any;

  beforeAll(async () => {
    runResult = await YoTest({
      source: import.meta.dirname + "/../../../generators/bun-package-json",
      options: {
        isReady: true,
        description: "foo-desc",
        keyword: "foo-keyword",
        authorName: "foo-name",
        authorEmail: "foo@foo.com",
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
    //   assert.file(["compile.sh", "index.html"]);
  });

  it("should have content", () => {
    assert.fileContent("package.json", "foo-desc");
    assert.fileContent("package.json", '"main": "./build/cjs/src/index.js"');
  });
});
