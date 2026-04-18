/**
 * https://yeoman.io/authoring/testing.html
 * https://gilsondev.gitbooks.io/yeoman-authoring/content/authoring/unit_testing.html
 *
 * https://github.com/yeoman/yeoman-assert/blob/main/index.js
 * https://github.com/yeoman/yeoman-test/blob/main/lib/run-context.js
 */

import { describe, it, beforeAll, afterAll } from "bun:test";
import { YoTest, assert } from "yo-unit";

describe("!! compile-sh !!", () => {
  let runResult: any;

  beforeAll(async () => {
    runResult = await YoTest({
      source: import.meta.dirname + "/../../../generators/compile-sh/.",
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
    //    assert.file(["src", "ui"]);
  });

  it("should have file", () => {
    //   assert.file(["compile.sh", "index.html"]);
  });

  it("should have content", () => {
    //    assert.fileContent('composer.json', 'foo-desc');
    //    assert.fileContent('.circleci/config.yml', 'foo');
  });
});
