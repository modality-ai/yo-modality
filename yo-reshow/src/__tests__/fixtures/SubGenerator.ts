import { YoGenerator } from "../../index";

export default class SubGenerator extends YoGenerator {
  writing() {
    if (typeof (this.options as any).onWriting === "function") {
      (this.options as any).onWriting("sub writing");
    }
  }
}
