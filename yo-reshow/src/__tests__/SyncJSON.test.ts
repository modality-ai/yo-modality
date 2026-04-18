import { describe, it, expect } from "bun:test";
import { YoHelper } from "../index";

describe("syncJSON", () => {
  it("calls callback with existing data and returns result", () => {
    const mock = {
      readDestinationJSON: () => ({ existing: true }),
      fs: { copy: () => {}, copyTpl: () => {} },
    };
    const { syncJSON } = YoHelper(mock);
    const result = syncJSON(null, "package.json", {}, (data: any) => {
      data.added = true;
      return data;
    });
    expect(result?.json.existing).toBe(true);
    expect(result?.json.added).toBe(true);
  });
});
