import { describe, it, expect } from "bun:test";
import { YoHelper } from "../index";

describe("promptResetDefault", () => {
  it("is a function", () => {
    const { promptResetDefault } = YoHelper({});
    expect(typeof promptResetDefault).toBe("function");
  });
});
