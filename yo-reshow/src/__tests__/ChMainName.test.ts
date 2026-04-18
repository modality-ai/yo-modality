import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { YoTest } from "yo-unit";
import { YoGenerator, YoHelper } from "../index";

class FakeGenerator extends YoGenerator {
  writing() {
    const { chMainName } = YoHelper(this);
    chMainName("newname");
  }
}

describe("chMainName", () => {
  let runResult: any;

  beforeAll(async () => {
    runResult = await YoTest({ source: FakeGenerator });
  });

  afterAll(() => {
    if (runResult) runResult.restore();
  });

  it("changes destinationRoot to include the new name", () => {
    expect(runResult.generator.destinationPath()).toContain("newname");
  });
});
