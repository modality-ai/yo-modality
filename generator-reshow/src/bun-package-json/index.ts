import { YoGenerator, YoHelper } from "yo-reshow";

const defaultPackageJSON = {
  devDependencies: {
    typescript: "*",
  },
  scripts: {
    "build:types": "bun tsc -p ./",
    build: "bun build:types",
    test: "npm run build && bun test",
  },
  files: ["dist", "package.json", "README.md"],
};

/**
 * package-json Generator
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
        data.bin = { [this.mainName]: "src/cli.ts" };
        return data;
      }
    );
  }
}
