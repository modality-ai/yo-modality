import { YoGenerator, YoHelper } from "yo-reshow";

/**
 * package-json Generator
 */
export default class extends YoGenerator {
  writing() {
    const { getDotYo, handleKeywords, updateJSON } = YoHelper(this);
    const payload = {
      mainName: "",
      description: "",
      babelRootMode: "",
      authorName: "",
      authorEmail: "",
      ...this.payload,
      ...this.options,
      ...getDotYo(this.options),
    };

    updateJSON(
      "package.json",
      null,
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
        data.repository = repository;
        data.homepage = repositoryHomepage;
        return data;
      }
    );
  }
}
