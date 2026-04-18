import * as PATH from "path";
import { STRING, FUNCTION, OBJ_SIZE } from "reshow-constant";

import getDestFolderName from "./getDestFolderName";
import isFile from "./isFile";
import isDir from "./isDir";
import unlink from "./unlink";

// for app
import YoSay from "yosay";
import { mkdirp } from "mkdirp";
import globSync from "./globSync";
import handleAnswers from "./handleAnswers";
import handleKeywords from "./handleKeywords";
import {
  getDotYo,
  promptResetDefault,
  promptFilterByOptions,
} from "./getDotYo";

const lastAns: { current: Record<string, unknown> } = { current: {} };
const exitCb: { current: (() => void) | null } = { current: null };
const onExit = (cb: () => void) => cb && (exitCb.current = cb);
process.once("exit", () => {
  if (FUNCTION === typeof exitCb.current && exitCb.current !== null) {
    exitCb.current();
  }
  process.exit(0);
});

/**
 * Copy
 *
 * https://yeoman.io/authoring/file-system.html#tip-update-existing-files-content
 * https://yeoman.github.io/generator/Generator.html#readTemplate
 * https://github.com/SBoudrias/mem-fs-editor
 * https://github.com/sboudrias/mem-fs
 */
const RUN_CP =
  (oGen: any) =>
  (src: string, dest?: string | null, options?: any, bOverwrite?: boolean) => {
    const oGenFs = oGen.fs;
    const action = options ? oGenFs.copyTpl : oGenFs.copy;

    let actualSrc: string;
    if (!isFile(src) || isFile(oGen.templatePath(src))) {
      dest = dest || (isDir(src) ? PATH.basename(src) : src);
      actualSrc = oGen.templatePath(src);
    } else {
      dest = dest || PATH.basename(src);
      actualSrc = src;
    }

    try {
      const realDestFile = oGen.destinationPath(dest);
      if (!isFile(realDestFile) || bOverwrite) {
        if (isFile(realDestFile) && bOverwrite) {
          unlink(realDestFile);
        }
        action.call(oGenFs, actualSrc, realDestFile, options);
      }
    } catch (e) {
      throw e;
    }
    return dest;
  };

/**
 * SAY
 *
 * https://github.com/yeoman/environment/blob/main/lib/util/log.js
 */
const RUN_SAY =
  (oGen: any) =>
  (message: unknown, options = { maxLength: 30 }) => {
    if (STRING !== typeof message) {
      oGen.log(JSON.stringify(message, null, "\t"));
    } else {
      oGen.log(YoSay(message as string, options));
    }
  };

const promptChainLocator = (prompts: any[]) => () => prompts.shift();

export type YoHelperType = {
  say: (message: unknown, options?: { maxLength: number }) => void;
  cp: (
    src: string,
    dest?: string | null,
    options?: any,
    bOverwrite?: boolean,
  ) => string;
  mkdir: (dir: string) => Promise<string | void | undefined>;
  getDestFolderName: () => string;
  chdir: (dir: string) => any;
  chMainName: (name?: string) => void;
  syncJSON: (
    src: string | null,
    dest: string | null,
    options?: any,
    cb?: (json: any, options?: any) => any,
  ) => { json: any; dest: string } | undefined;
  updateDestJSON: (
    dest: string,
    options?: any,
    cb?: (json: any, options?: any) => any,
  ) => { json: any } | undefined;
  updateJSON: (
    src: string | null,
    dest: string | null,
    options?: any,
    cb?: any,
  ) => { json: any } | undefined;
  onExit: (cb: () => void) => void;
  exit: (cb: () => void, statusCode?: number) => never;
  getDotYo: typeof getDotYo;
  isFile: (f: string) => string | false;
  glob: (srcPath: string, ...p: any[]) => void;
  promptResetDefault: typeof promptResetDefault;
  mergePromptOrOption: (
    prompts: any[],
    cb?: (nextPrompts: any[], nextAnswer?: any) => Promise<any>,
  ) => Promise<Record<string, unknown>>;
  promptChainLocator: typeof promptChainLocator;
  promptChain: (
    promptLocator: any,
    cb?: any,
    nextAnswer?: Record<string, unknown>,
  ) => any;
  promptChainAll: (
    prompts: any[],
    options?: { locator?: any; callback?: any },
  ) => Promise<Record<string, unknown>>;
  getAllAns: (customAns?: Record<string, unknown>) => Record<string, unknown>;
  handleAnswers: (
    answers: Record<string, any>,
    cb?: (payload: import("./handleAnswers").Payload) => void,
  ) => void;
  handleKeywords: typeof handleKeywords;
};

const YoHelper = (oGen: any): YoHelperType => {
  const mkdir = (dir: string) => mkdirp(oGen.destinationPath(dir));
  const chdir = (dir: string) => oGen.destinationRoot(dir);
  const cp = RUN_CP(oGen);
  const say = RUN_SAY(oGen);

  if (!exitCb.current) {
    onExit(() => say("Bye from us!\n Chat soon."));
  }

  const promptChain = (
    promptLocator: any,
    cb?: any,
    nextAnswer: Record<string, unknown> = {},
  ) => {
    cb = cb || (() => true);
    let i = 0;
    lastAns.current = nextAnswer;
    const go = (thisPrompt: any): any => {
      return thisPrompt
        ? oGen.prompt(thisPrompt).then((props: any) => {
            lastAns.current = { ...lastAns.current, ...props };
            const isContinue = cb(lastAns.current);
            if (isContinue) {
              i++;
              return go(promptLocator(i, lastAns.current));
            } else {
              return oGen.prompt([]);
            }
          })
        : OBJ_SIZE(lastAns.current)
          ? lastAns.current
          : oGen.prompt([]);
    };
    return go(promptLocator(i, lastAns));
  };

  const chainUtil = {
    mergePromptOrOption: (
      prompts: any[],
      cb = (nextPrompts: any[], nextAnswer?: any) =>
        promptChain(promptChainLocator(nextPrompts), undefined, nextAnswer),
    ) => {
      const options = {
        ...oGen.options,
        ...getDotYo(oGen.options),
      };
      const { nextAnswer, nextPrompts } = promptFilterByOptions(
        prompts,
        options,
      );
      return cb(nextPrompts, nextAnswer).then((props: any) => ({
        ...props,
        ...nextAnswer,
      }));
    },

    promptChainLocator,
    promptChain,
  };

  const syncJSON = (
    src: string | null,
    dest: string | null,
    options?: any,
    cb?: (json: any, options?: any) => any,
  ) => {
    if (src != null) {
      dest = cp(src, dest, options) as string;
    }
    cb = cb || ((json: any) => json);
    const json = oGen.readDestinationJSON(dest);
    const nextJson = cb(json, options);
    if (nextJson && dest != null) {
      return { json: nextJson, dest };
    }
    return undefined;
  };

  const updateDestJSON = (
    dest: string,
    options?: any,
    cb?: (json: any, options?: any) => any,
  ) => {
    const json = oGen.readDestinationJSON(dest);
    cb = cb || ((json: any) => json);
    const nextJson = cb(json, options);
    if (nextJson) {
      oGen.writeDestinationJSON(dest, json);
      return { json };
    }
    return undefined;
  };

  return {
    say,
    cp,
    mkdir,
    getDestFolderName: () => getDestFolderName(oGen),
    chdir,
    chMainName: (name: string = oGen.mainName) => {
      if (name !== getDestFolderName(oGen)) {
        chdir(name);
      }
    },

    syncJSON,
    updateDestJSON,
    updateJSON: (src: string | null, dest: string | null, options?: any, cb?: any) => {
      const result = syncJSON(src, dest, options, cb);
      if (result) {
        const { json, dest: resolvedDest } = result;
        oGen.writeDestinationJSON(resolvedDest, json);
        return { json };
      }
      return undefined;
    },

    onExit,
    exit: (cb: () => void, statusCode = 0) => {
      onExit(cb);
      process.exit(statusCode);
    },

    getDotYo,
    isFile: (f: string) => {
      const destPath = oGen.destinationPath(f);
      if (isFile(destPath)) {
        return destPath;
      } else {
        return false;
      }
    },
    glob: (srcPath: string, ...p: any[]) => {
      const actualSrc = isDir(srcPath)
        ? srcPath
        : oGen.templatePath(srcPath || "");
      globSync(actualSrc, p[0], p[1]);
    },

    promptResetDefault,
    ...chainUtil,
    promptChainAll: (
      prompts: any[],
      {
        locator = chainUtil.promptChainLocator,
        callback,
      }: { locator?: any; callback?: any } = {},
    ) => {
      return chainUtil.mergePromptOrOption(
        prompts,
        (nextPrompts, nextAnswer) => {
          return chainUtil.promptChain(
            locator(nextPrompts),
            callback,
            nextAnswer,
          );
        },
      );
    },
    getAllAns: (customAns?: Record<string, unknown>) => {
      return { ...customAns, ...lastAns.current };
    },
    handleAnswers: handleAnswers(oGen),
    handleKeywords,
  };
};

export default YoHelper;
