import PATH from "path";
import FS from "fs";
import { execSync } from "child_process";
import { createRequire } from "module";

const _require = createRequire(import.meta.url);

const npxPath = () => {
  const path = "node_modules/npm/node_modules/libnpx/";
  const binPath = PATH.dirname(process.execPath);
  const getPath = (p: string[]) => PATH.join(binPath, ...p);
  let libnpx = getPath(["../lib", path]);
  if (!FS.existsSync(libnpx)) {
    libnpx = getPath([path]);
  }
  if (!FS.existsSync(libnpx)) {
    libnpx = getPath(["../lib", "node_modules/npm/lib/cli.js"]);
  }
  let npmCli = getPath(["npm"]);

  // Fallback: resolve npm from PATH when running under bun or non-standard node
  if (!FS.existsSync(libnpx) || !FS.existsSync(npmCli)) {
    try {
      const npmBin = execSync("which npm", { encoding: "utf8" }).trim();
      if (npmBin && FS.existsSync(npmBin)) {
        npmCli = npmBin;
        const fallback = PATH.resolve(
          PATH.dirname(npmBin),
          "../lib/node_modules/npm/lib/cli.js"
        );
        if (FS.existsSync(fallback)) {
          libnpx = fallback;
        }
      }
    } catch {}
  }

  return { libnpx, npmCli };
};
const { libnpx, npmCli } = npxPath();

const npx8 = (cmd: string[]) => {
  const npmcli = _require(libnpx);
  process.argv[1] = libnpx;
  process.argv.splice(2, 0, "exec");
  for (let i = 0, j = cmd.length; i < j; i++) {
    process.argv[i + 3] = cmd[i]!;
  }
  npmcli(process);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const npx: any =
  libnpx.slice(-6) === "cli.js" ? npx8 : createRequire(libnpx)("libnpx");

const pkgPrefix = "generator-";
const isOrgReg = /^@[^/]+\//;
const addOrgGenReg = /^@([^/]+)\/(generator-)?/;
const addGenReg = new RegExp(`^(${pkgPrefix})?`);
const getPkgName = (generator: string) =>
  isOrgReg.test(generator)
    ? generator.replace(addOrgGenReg, "@$1/" + pkgPrefix)
    : generator.replace(addGenReg, pkgPrefix);

const getNpxCmd = (argv: string[]) => {
  const generatorName = argv[2];
  const otherArgv = argv.slice(3);
  const [generatorPkg] = (generatorName || "").split(":");
  if (!generatorPkg) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cmd: any = [
    "--package",
    "yo",
    "--package",
    getPkgName(generatorPkg),
    "--call",
    `yo ${generatorName} ${otherArgv.join(" ")}`,
  ];
  if (npx.parseArgs != null) {
    cmd = npx.parseArgs(cmd, npmCli);
  }

  return cmd;
};

const init = async () => {
  const argv = process.argv;
  const cmdOptions = getNpxCmd(argv);
  if (cmdOptions) {
    await npx(cmdOptions);
  } else {
    console.error("Generator not found.", argv);
    process.exit(1);
  }
};

export { init, getNpxCmd, getPkgName, npxPath };
