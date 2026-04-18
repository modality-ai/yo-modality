import { YoGenerator, YoHelper } from "yo-reshow";

/**
 * Hono Generator
 */

const defaultPackageJSON = {
  dependencies: {
    hono: "*",
  },
  scripts: {
    start: "bun run src/index.ts",
    dev: "bun --hot src/index.ts",
  },
  files: ["dist", "package.json", "README.md"],
};

export default class extends YoGenerator {
  /**
   * Run loop (Life cycle)
   * https://yeoman.io/authoring/running-context.html#the-run-loop
   */

  async prompting() {
    this.composeWith(require.resolve("../bun"), {});
  }

  writing() {
    this.env.options.nodePackageManager = "bun";
    const { cp } = YoHelper(this);

    cp("src/index.ts", null, this.payload);
  }

  conflicts() {
    const { handleKeywords, updateDestJSON } = YoHelper(this);
    const payload = this.payload || {};

    updateDestJSON(
      "package.json",
      payload,
      (data: any, { keyword, repository, repositoryHomepage }: any) => {
        handleKeywords(keyword, (arr: any) => (data.keywords = arr));
        Object.assign(data, defaultPackageJSON);
        data.repository = repository;
        data.homepage = repositoryHomepage;
        return data;
      }
    );
  }
}
