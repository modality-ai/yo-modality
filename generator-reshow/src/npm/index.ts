import { YoGenerator, YoHelper, commonPrompt } from "yo-reshow";

/**
 * NPM Generator
 */

export default class extends YoGenerator {
  /**
   * Run loop (Life cycle)
   * https://yeoman.io/authoring/running-context.html#the-run-loop
   *
   * 1. initializing
   * 2. prompting
   * 3. configuring
   * 4. default
   * 5. writing
   * 6. conflicts
   * 7. install
   * 8. end
   */

  /**
   * Questions.
   *
   * https://www.alwaystwisted.com/post.php?s=using-lists-in-a-yeoman-generator
   * https://github.com/SBoudrias/Inquirer.js
   */
  async prompting() {
    const {
      handleAnswers,
      mergePromptOrOption,
    } = YoHelper(this);

    const prompts = [
      ...commonPrompt.mainName(this),
      ...commonPrompt.babel(this),
      ...commonPrompt.desc(this),
      ...commonPrompt.author(this),
      ...commonPrompt.repository(this),
    ];

    const answers = await mergePromptOrOption(prompts);
    handleAnswers(answers, (payload: any) => {
      if (payload.isUseBabel) {
        this.composeWith(require.resolve("../compile-sh"), payload);
      }
      this.composeWith(require.resolve("../babel-package-json"), payload);
    });
  }

  writing() {
    this.env.options.nodePackageManager = "yarn";
    const { cp, chMainName } = YoHelper(this);
    const { isUseBabel, isUseBabelUI, babelRootMode } = this.payload || {};

    // handle change to new folder
    chMainName(this.mainName);

    // handle copy file
    cp("README.md", null, this.payload);
    cp("_gitignore", ".gitignore", this.payload);
    if (isUseBabel) {
      if (null == babelRootMode) {
        cp("babel.config.js");
      }
      if (isUseBabelUI) {
        cp("ui-src", "src");
        cp("UITest.js", "src/ui/pages/__tests__/IndexTest.js", this.payload);
      } else {
        cp("lib-src", "src");
        cp("LIBTest.js", "src/__tests__/LibTest.js", this.payload);
      }
    } else {
      cp("src", null, this.payload);
      cp("Test.js", "src/__tests__/Test.js", this.payload);
    }
  }
}
