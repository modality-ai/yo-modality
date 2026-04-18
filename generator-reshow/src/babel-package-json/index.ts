import { YoGenerator, YoHelper } from "yo-reshow";

const getUIBuildTypeScript = (filePattern: string) =>
  `npx -p typescript tsc src/*.js ${filePattern} --jsx react-jsx --lib esnext,dom --declaration --allowJs --emitDeclarationOnly --skipLibCheck --declarationDir types`;

const defaultPackageJSON = {
  dependencies: {
    "reshow-constant": "*",
    "reshow-runtime": "*",
  },
  devDependencies: {
    "@babel/cli": "^7.x",
    "reshow-unit-dom": "*",
  },
  scripts: {
    "update-compile-sh": "yo reshow:compile-sh",
    webpack: "webpack",
    start: "ws",
    format: "prettier-eslint --write 'src/**/*.js'",
    "clean:webpack": "find ./assets -name '*.*' | xargs rm -rf",
    clean: "find ./build ./types -name '*.*' | xargs rm -rf",
    "build:cjs":
      "BABEL_ENV=cjs babel src -d build/cjs/src --ignore /**/__tests__<%= babelRootMode %>",
    "build:es":
      "BABEL_ENV=es babel src -d build/es/src --out-file-extension .mjs<%= babelRootMode %>",
    "build:type":
      "npx -p typescript tsc src/*.js src/**/*.js --lib esnext --declaration --allowJs --emitDeclarationOnly --skipLibCheck --declarationDir types",
    build:
      "npm run clean && npm run build:cjs && npm run build:es && npm run build:type",
    mochaFor: "STRICT_MODE=on mocha -r global-jsdom/register",
    mocha: "npm run mochaFor -- 'build/{cjs,es}/**/__tests__/*.{js,mjs}'",
    "test:report":
      "npm run build && npm run mochaFor -- --reporter mocha-junit-reporter --reporter-options mochaFile=./test_output/mocha.xml 'build/{cjs,es}/**/__tests__/*.{js,mjs}'",
    test: "npm run build && npm run mocha",
    prepublishOnly: "npm run test",
  },
  files: ["types", "build", "package.json", "README.md"],
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
    const { cp, handleKeywords, updateDestJSON } = YoHelper(this);
    const payload = this._payload;

    updateDestJSON(
      "package.json",
      payload,
      (
        data: any,
        {
          isApp,
          isUseWebpack,
          isUseBabel,
          isUseBabelUI,
          keyword,
          repository,
          repositoryHomepage,
          npmDependencies,
          mainName,
        }: any
      ) => {
        handleKeywords(keyword, (arr: any) => (data.keywords = arr));
        Object.assign(data, defaultPackageJSON);
        data.repository = repository;
        data.homepage = repositoryHomepage;
        if (isApp) {
          data.private = true;
          data.dependencies = {
            pmvc_react_admin: "*",
            react: "^18.x",
            "react-dom": "^18.x",
            "reshow-app": "*",
            ...npmDependencies,
          };
          delete data.devDependencies;
          delete data.version;
          data.scripts.prepublishOnly = "exit 1;";
          data.scripts.build = "npm run clean && npm run build:es";
          data.scripts["build:type"] = getUIBuildTypeScript("src/ui/**/*.jsx");
        } else {
          delete data.private;
          data.dependencies = {
            ...data.dependencies,
            ...npmDependencies,
          };
        }
        if (!isUseBabel) {
          if (data.devDependencies) {
            delete data.devDependencies["@babel/cli"];
          }
          delete data.exports;
          delete data.module;
          delete data.scripts["build:cjs"];
          data.main = "./src/index.js";
          data.bin[mainName] = "./src/index.js";
          data.files = data.files.filter((f: string) => f !== "build");
          data.files.push("src");
        } else {
          data.devDependencies["react-atomic-atom"] = "*";
        }
        if (isUseBabelUI) {
          delete data.bin;
          data.devDependencies["react"] = "^18.x";
          data.devDependencies["react-dom"] = "^18.x";
          data.devDependencies["reshow-unit"] = "*";
          data.scripts["build:type"] = getUIBuildTypeScript("src/ui/**/*.jsx");
          delete data.devDependencies["reshow-unit-dom"];
        }
        if (!isUseWebpack) {
          delete data.scripts["webpack"];
          delete data.scripts["clean:webpack"];
        } else {
          cp(".yo");
        }
        if (!isApp && !isUseBabel) {
          delete data.scripts["build:es"];
          delete data.scripts.build;
          delete data.scripts.clean;
          data.scripts.test = "npm run mocha";
          data.scripts.mocha =
            "npm run mochaFor -- 'src/**/__tests__/*.{js,mjs}'";
        }
        return data;
      }
    );
  }
}
