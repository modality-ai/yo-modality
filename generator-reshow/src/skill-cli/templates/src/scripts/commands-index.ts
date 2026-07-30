import { createCommandRegistry } from "modality-cli-kit";
import { fooCommand } from "./commands/foo";
import { barCommand } from "./commands/bar";

/** The CLI binary name, shown in help usage lines. */
export const CLI_NAME = "<%= mainName %>";

/** The one-line tagline for the CLI, shown at the top of help. */
export const TAGLINE = "<%= mainName %> command-line toolkit";

/**
 * The command registry — the single place commands and their aliases are
 * wired together. Add a command by importing it into the first argument;
 * add an alias via the second (map only, never on the command object).
 */
export const registry = createCommandRegistry(
  [fooCommand, barCommand],
  {
    foo: ["f"],
    bar: ["b", "baz"],
  },
);
