import { describe, it, expect } from "bun:test";
import { YoHelper } from "../index";

describe("say", () => {
  it("logs the message", () => {
    let logged: any;
    const mock = { log: (msg: any) => { logged = msg; } };
    const { say } = YoHelper(mock);
    say("hello");
    expect(logged).toContain("hello");
  });
});
