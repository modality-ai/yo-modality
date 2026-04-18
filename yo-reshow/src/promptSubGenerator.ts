import * as fs from "fs";
import * as path from "path";

/**
 * Scan the generators directory and return a sorted list of sub-generator names,
 * excluding the one passed as `exclude` (typically "app").
 */
const getSubGenerators = (generatorsDir: string, exclude?: string): string[] =>
  fs
    .readdirSync(generatorsDir)
    .filter(
      (name) =>
        name !== exclude &&
        fs.statSync(path.join(generatorsDir, name)).isDirectory(),
    )
    .sort();

/**
 * Returns true when the user explicitly typed `yo <pkg>:<name>` (e.g. `yo reshow:app`),
 * meaning the sub-generator was addressed directly and the menu should be skipped.
 */
const isDirectInvocation = (): boolean =>
  process.argv.some((arg) => arg.includes(":"));

/**
 * Prompt the user to pick a sub-generator, then compose with it.
 * Skips the menu when the generator was invoked directly (e.g. `yo reshow:app`).
 *
 * @param oGen    - The active yeoman generator instance (`this` inside a generator)
 * @param options
 *   currentDir  - `__dirname` of the calling generator (used to locate siblings)
 *   exclude     - Sub-generator name to exclude from the list (default: "app")
 *   first       - Prepend this entry to the top of the list (default: "app")
 *
 * @returns The name of the selected sub-generator, or null when the current
 *          generator should handle the request itself.
 *
 * @example
 * // Inside app/index.ts prompting():
 * const selected = await promptSubGenerator(this, { currentDir: __dirname });
 * if (selected) return; // another generator was composed — skip app logic
 */
const promptSubGenerator = async (
  oGen: any,
  {
    currentDir,
    exclude = "app",
    first = "app",
  }: { currentDir: string; exclude?: string; first?: string },
): Promise<string | null> => {
  if (isDirectInvocation()) {
    return null;
  }

  const generatorsDir = path.resolve(currentDir, "..");
  const subGenerators = getSubGenerators(generatorsDir, exclude);

  const { generator: selected } = await oGen.prompt([
    {
      type: "list",
      name: "generator",
      message: "Which generator would you like to run?",
      choices: [first, ...subGenerators],
    },
  ]);

  if (selected && selected !== first) {
    oGen.composeWith(require.resolve(path.join(generatorsDir, selected)), {
      ...oGen.options,
    });
    return selected;
  }

  return null;
};

export { getSubGenerators, promptSubGenerator };
