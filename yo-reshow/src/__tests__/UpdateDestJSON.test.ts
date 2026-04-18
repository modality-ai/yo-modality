import { describe, it, expect } from "bun:test";
import { YoHelper } from "../index";

describe("updateDestJSON", () => {
  it("reads existing data, applies callback, and writes result", () => {
    let written: any;
    const mock = {
      readDestinationJSON: () => ({ name: "test" }),
      writeDestinationJSON: (_: string, data: any) => { written = data; },
    };
    const { updateDestJSON } = YoHelper(mock);
    updateDestJSON("package.json", {}, (data: any) => {
      data.version = "1.0.0";
      return data;
    });
    expect(written.name).toBe("test");
    expect(written.version).toBe("1.0.0");
  });
});
