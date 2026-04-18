/**
 * https://yeoman.io/authoring/testing.html
 * https://gilsondev.gitbooks.io/yeoman-authoring/content/authoring/unit_testing.html
 *
 * https://github.com/yeoman/yeoman-assert/blob/main/index.js
 * https://github.com/yeoman/yeoman-test/blob/main/lib/run-context.js
 */

import { describe, it, beforeAll, afterAll } from "bun:test";
import { YoTest, assert } from "yo-unit";

describe("!! generator !!", () => {
  let runResult: any;

  beforeAll(async () => {
    runResult = await YoTest({
      source: import.meta.dirname + "/../../../generators/generator/.",
      params: {
        isReady: true,
        description: "foo-desc",
        keyword: "foo-keyword",
      },
    });
  });

  afterAll(() => {
    if (runResult) {
      runResult.restore();
    }
  });

  it("should have folder", () => {
    assert.file(["__tests__"]);
  });

  it("should have file", () => {
    assert.file(["README.md", "index.js"]);
  });

  it("should have content", () => {
    assert.fileContent("README.md", "foo");
  });
});
