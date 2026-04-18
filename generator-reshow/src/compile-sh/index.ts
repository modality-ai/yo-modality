import { YoGenerator, YoHelper } from "yo-reshow";

/**
 * compile-sh Generator
 */
export default class extends YoGenerator {
  writing() {
    const { cp, getDotYo } = YoHelper(this);
    const { webpackEnabled } = { ...this.options, ...getDotYo(this.options) };
    cp("compile.sh", null, { webpackEnabled }, true);
  }
}
