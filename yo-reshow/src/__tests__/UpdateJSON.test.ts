import { describe, it, expect } from "bun:test";
import { YoHelper } from "../index";

describe("updateJSON", () => {
  it("writes the callback result to dest", () => {
    let written: any;
    const mock = {
      readDestinationJSON: () => ({ base: true }),
      writeDestinationJSON: (_: string, data: any) => { written = data; },
      fs: { copy: () => {}, copyTpl: () => {} },
    };
    const { updateJSON } = YoHelper(mock);
    updateJSON(null, "package.json", {}, (data: any) => {
      data.updated = true;
      return data;
    });
    expect(written.updated).toBe(true);
  });
});
