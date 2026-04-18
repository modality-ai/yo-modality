import { expect, test, describe } from "bun:test";
import FS from "fs";
import { getNpxCmd, getPkgName, npxPath } from "../init";

describe("Test yonpx", () => {
  test("test getNpxCmd", () => {
    const actual = getNpxCmd(["", "", "reshow"]);
    if (actual && (actual as { p?: string[] }).p) {
      expect((actual as { p: string[] }).p).toEqual([
        "yo@latest",
        "generator-reshow@latest",
      ]);
    } else {
      expect((actual as string[])[5]).toBe("yo reshow ");
    }
  });
});

describe("Test getPkgName", () => {
  test("basic app", () => {
    const generatorName = "app";
    const actual = getPkgName(generatorName);
    expect(actual).toBe("generator-app");
  });

  test("org with app", () => {
    const generatorName = "@org/app";
    const actual = getPkgName(generatorName);
    expect(actual).toBe("@org/generator-app");
  });
});

describe("Test npxPath", () => {
  const isExists = (f: string) => FS.existsSync(f);
  test("test npxPath", () => {
    const { libnpx, npmCli } = npxPath();
    console.log("npx path: " + libnpx);
    expect(isExists(libnpx)).toBe(true);
    expect(isExists(npmCli)).toBe(true);
  });
});
