/**
 * https://yeoman.io/authoring/testing.html
 * https://gilsondev.gitbooks.io/yeoman-authoring/content/authoring/unit_testing.html
 *
 * https://github.com/yeoman/yeoman-assert/blob/main/index.js
 * https://github.com/yeoman/yeoman-test/blob/main/lib/run-context.js
 */

import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { YoTest, assert } from "yo-unit";

describe("generator-reshow:app", () => {
  let runResult: any;
  let setupError: Error | null = null;

  beforeAll(async () => {
    try {
      runResult = await YoTest({
        source: import.meta.dirname + "/../../../generators/app/.",
        params: {
          isReady: true,
          description: "foo-desc",
          keyword: "foo-keyword",
        },
      });
    } catch (e) {
      setupError = e as Error;
    }
  });

  afterAll(()=>{
    if (runResult) {
      runResult.restore();
    }
  });

  it("should setup without error", () => {
    expect(setupError).toBeNull();
  });

  it("should have folder", () => {
    assert.file(["src", "src/ui"]);
  });

  it("should have file", () => {
    assert.file(["compile.sh", "index.tpl"]);
  });

  it("should have content", () => {
    //    assert.fileContent('composer.json', 'foo-desc');
    //    assert.fileContent('.circleci/config.yml', 'foo');
  });
});
