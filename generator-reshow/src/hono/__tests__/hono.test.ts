/**
 * https://yeoman.io/authoring/testing.html
 * https://gilsondev.gitbooks.io/yeoman-authoring/content/authoring/unit_testing.html
 *
 * https://github.com/yeoman/yeoman-assert/blob/main/index.js
 * https://github.com/yeoman/yeoman-test/blob/main/lib/run-context.js
 */

import { describe, it, beforeAll, afterAll } from "bun:test";
import { YoTest, assert } from "yo-unit";

describe("!! hono !!", () => {
  let runResult: any;

  beforeAll(async () => {
    runResult = await YoTest({
      source: import.meta.dirname + "/../../../generators/hono",
      params: {
        isReady: true,
        description: "foo-desc",
        keyword: "foo-keyword",
        repositoryName: "foo-repository-name",
        repositoryOrgName: "foo-repository-org-name",
      },
    });
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
    assert.file(["src/index.ts"]);
  });

  it("should have content", () => {
    assert.fileContent("src/index.ts", "Hono");
    assert.fileContent("package.json", "hono");
    assert.fileContent("package.json", "foo-desc");
  });
});
