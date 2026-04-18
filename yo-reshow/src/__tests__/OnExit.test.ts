import { describe, it, expect } from "bun:test";
import { YoHelper } from "../index";

describe("onExit", () => {
  it("registers a callback without throwing", () => {
    const mock = { on: function() { return this; } };
    const { onExit } = YoHelper(mock);
    expect(() => onExit(() => {})).not.toThrow();
  });
});
