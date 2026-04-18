import { YoGenerator, YoHelper } from "yo-reshow";


const defaultPackageJSON = {
  devDependencies: {
    "typescript": "*",
  },
  scripts: {},
  files: ["dist", "package.json", "README.md"],
};

/**
 * package-json Generator
 */
export default class extends YoGenerator {
  _payload: any;

  writing() {
    const { getDotYo } = YoHelper(this);
    this._payload = {
      mainName: "",
      description: "",
      babelRootMode: "",
      authorName: "",
      authorEmail: "",
      ...this.payload,
      ...this.options,
      ...getDotYo(this.options),
    };

    this.composeWith(require.resolve("../package-json"), this._payload);
  }

  conflicts() {
    const { handleKeywords, updateDestJSON } = YoHelper(this);
    const payload = this._payload;

    updateDestJSON(
      "package.json",
      payload,
      (
        data: any,
        {
          keyword,
          repository,
          repositoryHomepage,
        }: any
      ) => {
        handleKeywords(keyword, (arr: any) => (data.keywords = arr));
        Object.assign(data, defaultPackageJSON);
        data.repository = repository;
        data.homepage = repositoryHomepage;
        return data;
      }
    );
  }
}
