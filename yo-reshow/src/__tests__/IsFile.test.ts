import { describe, it, expect } from "bun:test";
import * as fs from "fs";
import { YoHelper } from "../index";

const mock = { destinationPath: (p: string) => p };

describe("isFile", () => {
  it("returns false for non-existent file", () => {
    const { isFile } = YoHelper(mock);
    expect(isFile("/tmp/yo-isfile-not-exist.txt")).toBe(false);
  });

  it("returns the path for an existing file", () => {
    const tmpFile = "/tmp/yo-isfile-test.txt";
    fs.writeFileSync(tmpFile, "test");
    const { isFile } = YoHelper(mock);
    const result = isFile(tmpFile);
    fs.unlinkSync(tmpFile);
    expect(result).toBe(tmpFile);
  });
});
