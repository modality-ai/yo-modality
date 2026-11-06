import { YoGenerator, YoHelper, commonPrompt } from "yo-reshow";

/**
 * Hono Generator
 */

/**
 * Map React-style imports onto hono/jsx/dom type definitions, so the generated
 * project can write familiar React imports while rendering with Hono JSX.
 * Same mapping as use-design/tsconfig.json.
 */
const reactJsxPaths: Record<string, string[]> = {
  react: ["./node_modules/hono/dist/types/jsx/dom/index.d.ts"],
  "react/jsx-runtime": ["./node_modules/hono/dist/types/jsx/dom/jsx-runtime.d.ts"],
  "react/jsx-dev-runtime": ["./node_modules/hono/dist/types/jsx/dom/jsx-dev-runtime.d.ts"],
  "react-dom": ["./node_modules/hono/dist/types/jsx/dom/index.d.ts"],
  "react-dom/client": ["./node_modules/hono/dist/types/jsx/dom/client.d.ts"],
};

/**
 * hono/jsx/dom types reference DOM globals, so the DOM libs are required.
 * Only append missing entries, never replace what the user already chose.
 */
const addDomLibs = (lib: unknown): string[] => {
  const next = Array.isArray(lib) ? [...lib] : [];
  ["DOM", "DOM.Iterable"].forEach((name) => {
    if (!next.includes(name)) {
      next.push(name);
    }
  });
  return next;
};

const defaultPackageJSON = {
  dependencies: {
    hono: "*",
    "@hono/bun": "*",
  },
  devDependencies: {
    "modality-bun-kit": "*",
  },
  scripts: {
    "build:types": "bun tsc -p ./",
    "build:client": "bun run src/build.ts",
    build: "bun build:types && bun build:client",
    test: "npm run build && bun test",
    start: "bun run src/runner/server.ts",
    dev: "bun --hot src/runner/server.ts",
  },
  files: ["dist", "package.json", "README.md"],
};

export default class extends YoGenerator {
  /**
   * Run loop (Life cycle)
   * https://yeoman.io/authoring/running-context.html#the-run-loop
   */

  async prompting() {
    const { handleAnswers, mergePromptOrOption, composeWithBefore } =
      YoHelper(this);

    const prompts = [
      ...commonPrompt.mainName(this),
      ...commonPrompt.desc(this),
      ...commonPrompt.author(this),
      ...commonPrompt.repository(this),
    ];

    const answers = await mergePromptOrOption(prompts);
    handleAnswers(answers, (payload: any) => {
      composeWithBefore(require.resolve("../bun"), payload);
    });
  }

  writing() {
    this.env.options.nodePackageManager = "bun";
    const { cp, chMainName, updateDestJSON } = YoHelper(this);

    // handle change to new folder
    chMainName(this.mainName);

    cp("src/runner/server.ts", null, this.payload);
    cp("src/runner/static.ts", null, this.payload);
    cp("src/cli.ts", null, this.payload);
    cp("src/build.ts", null, this.payload);
    cp("src/runner/client.tsx", null, this.payload);

    /**
     * Merge Hono JSX settings into the tsconfig written by the bun generator.
     * Additive only: existing user options always win.
     */
    updateDestJSON("tsconfig.json", this.payload, (data: any = {}) => {
      const compilerOptions = (data.compilerOptions = {
        ...data.compilerOptions,
      });
      if (compilerOptions.jsx === undefined) {
        compilerOptions.jsx = "react-jsx";
      }
      if (compilerOptions.jsxImportSource === undefined) {
        compilerOptions.jsxImportSource = "react";
      }
      compilerOptions.paths = {
        ...reactJsxPaths,
        ...compilerOptions.paths,
      };
      compilerOptions.lib = addDomLibs(compilerOptions.lib);
      return data;
    });
  }

  conflicts() {
    const { handleKeywords, updateDestJSON } = YoHelper(this);
    const payload = this.payload || {};

    updateDestJSON(
      "package.json",
      payload,
      (data: any = {}, { keyword, repository, repositoryHomepage }: any) => {
        handleKeywords(keyword, (arr: any) => (data.keywords = arr));
        Object.assign(data, defaultPackageJSON);
        data.repository = repository;
        data.homepage = repositoryHomepage;
        data.bin = { [this.mainName]: "src/cli.ts" };
        return data;
      }
    );
  }
}
