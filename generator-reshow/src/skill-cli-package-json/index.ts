import { YoGenerator, YoHelper } from "yo-reshow";

const defaultPackageJSON = {
  dependencies: {
    "modality-cli-kit": "*",
    "modality-mcp-kit": "*",
    zod: "*",
  },
  devDependencies: {
    "modality-bun-kit": "*",
  },
  exports: {
    types: "./types/index.d.ts",
    require: "./dist/index.js",
    import: "./dist/index.js",
  },
  types: "./types/index.d.ts",
  main: "./dist/index.js",
  module: "./dist/index.js",
  scripts: {
    clean: "find ./dist -name '*.*' | xargs rm -rf",
    "build:types": "bun tsc -p ./",
    "build:cli":
      "bun build ./src/runner/cli.ts ./src/index.ts --target=bun --outdir=./dist --root=./src",
    build:
      "bun run clean && bun run build:types && bun run build:cli && chmod +x ./dist/runner/cli.js",
    test: "npm run build && bun test",
  },
  files: ["dist", "package.json", "README.md"],
};

/**
 * skill-cli-package-json Generator
 *
 * Owns the package.json shape for a `modality-cli-kit` toolkit: a `bin`
 * pointing at the built CLI runner, the `modality-cli-kit` runtime dependency,
 * and the clean/build:types/build:cli pipeline.
 */
export default class extends YoGenerator {
  default() {
    const { getDotYo, composeWithBefore } = YoHelper(this);

    this.payload = {
      mainName: "",
      description: "",
      authorName: "",
      authorEmail: "",
      ...this.payload,
      ...this.options,
      ...getDotYo(this.options),
    };
    composeWithBefore(require.resolve("../package-json"), this.payload);
  }

  conflicts() {
    const { handleKeywords, updateDestJSON } = YoHelper(this);
    const payload = this.payload || {};

    updateDestJSON(
      "package.json",
      payload,
      (data: any = {}, { keyword, repository, repositoryHomepage }: any) => {
        handleKeywords(keyword, (arr: any) => (data.keywords = arr));
        const { scripts: defaultScripts, ...restDefaults } = defaultPackageJSON;
        Object.assign(data, restDefaults);
        data.scripts = { ...defaultScripts, ...data.scripts };
        data.repository = repository;
        data.homepage = repositoryHomepage;
        data.bin = { [this.mainName]: "./dist/runner/cli.js" };
        return data;
      }
    );
  }
}
