import { describe, it, expect } from "bun:test";
import { init } from "../init";

describe("Test <%= mainName %>", () => {
  it("basic test", () => {
    /*your test code*/
    const actual = init();
    expect(actual).toBe('bar');
  });
});
