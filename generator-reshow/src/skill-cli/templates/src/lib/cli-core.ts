import { z } from "zod";
import { createCliRunner } from "modality-cli-kit";
import { aiTool } from "../scripts";
import { registry } from "../scripts/commands-index";

/**
 * The <%= mainName %> CLI. All the generic machinery (help, alias resolution, arg
 * validation, dispatch) lives in `modality-cli-kit`; this file only supplies
 * the app-specific config. With no command, fall back to the original AI tool.
 */
export const cli = createCliRunner({
  cliName: "<%= mainName %>",
  tagline: "<%= mainName %> command-line toolkit",
  registry,
  globalOptionsSchema: z.object({
    help: z.boolean().optional().describe("Show this help message"),
    json: z.boolean().optional().describe("Output in JSON format"),
  }),
  onEmpty: async () => {
    console.log("Running AI Tool...");
    await aiTool.execute({});
    return 0;
  },
});

export const runCli = cli.run;
