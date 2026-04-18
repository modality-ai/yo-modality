import { describe, it, expect } from "bun:test";
import { YoHelper } from "../index";

describe("getDestFolderName", () => {
  it("returns the basename of destinationRoot", () => {
    const mock = { destinationRoot: () => "/some/path/myproject" };
    const { getDestFolderName } = YoHelper(mock);
    expect(getDestFolderName()).toBe("myproject");
  });
});
