import { describe, it, expect } from "bun:test";
import { YoHelper } from "../index";

describe("getAllAns", () => {
  it("returns customAns merged with lastAns", () => {
    const { getAllAns } = YoHelper({});
    const result = getAllAns({ foo: "bar" });
    expect(result.foo).toBe("bar");
  });
});
