import { expect, describe, it } from "bun:test";
import { promptSubGenerator } from "../promptSubGenerator";

/**
 * Reproduces: TypeError: The "paths[1]" property must be of type string, got undefined
 *
 * When the yeoman prompt returns undefined for the generator selection
 * (e.g. no mock answer provided in tests), promptSubGenerator must NOT
 * call composeWith — it should safely return null instead of crashing.
 */
describe("promptSubGenerator", () => {
  it("should return null when prompt answer is undefined (no answer provided)", async () => {
    const composeWithCalls: any[] = [];
    const oGen = {
      prompt: async (_questions: any[]) => ({ generator: undefined }),
      composeWith: (...args: any[]) => composeWithCalls.push(args),
      options: {},
    };

    const result = await promptSubGenerator(oGen as any, {
      currentDir: __dirname,
    });

    expect(result).toBeNull();
    expect(composeWithCalls).toHaveLength(0);
  });
});
