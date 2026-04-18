import { expect, describe, it, beforeAll, afterAll } from "bun:test";
import { YoTest } from "yo-unit";
import { YoGenerator, YoHelper } from "../index";

const order: string[] = [];

class ParentGenerator extends YoGenerator {
  default() {
    const { composeWithBefore } = YoHelper(this);
    composeWithBefore(require.resolve("./fixtures/SubGenerator"), this.options);
  }

  writing() {
    order.push("parent writing");
  }
}

describe("ComposeWithBefore", () => {
  let runResult: any;

  beforeAll(async () => {
    order.length = 0;
    runResult = await YoTest({
      source: ParentGenerator,
      options: {
        pwd: __dirname,
        onWriting: (label: string) => order.push(label),
      },
    });
  });

  afterAll(() => {
    if (runResult) runResult.restore();
  });

  it("sub runs before parent in writing phase", () => {
    expect(order).toEqual(["sub writing", "parent writing"]);
  });
});
