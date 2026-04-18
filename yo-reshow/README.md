Yeoman utility for reshow. (easy yeoman tool) 
===============

* GIT
   * https://github.com/modality-ai/yo-modality/tree/main/yo-reshow
* NPM
   * https://www.npmjs.com/package/yo-reshow

## How to use
https://github.com/modality-ai/yo-modality/blob/main/generator-reshow/src/app/index.ts

## call exit
```ts
import { YoGenerator, YoHelper } from "yo-reshow";

export default class extends YoGenerator {
  initializing() {
    const { exit } = YoHelper(this);
    exit(true);
  }
}
```
