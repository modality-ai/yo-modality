import { createCommandRegistry } from "modality-cli-kit";
import { fooCommand } from "./commands/foo";
import { barCommand } from "./commands/bar";

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
