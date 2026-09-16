import { createCommandRegistryFromDir, resolveCommandsDir } from "modality-cli-kit";

/** The CLI binary name, shown in help usage lines. */
export const CLI_NAME = "<%= mainName %>";

/** The one-line tagline for the CLI, shown at the top of help. */
export const TAGLINE = "<%= mainName %> command-line toolkit";

/**
 * The command registry, scanned from the commands directory.
 *
 * There is no index module to maintain: every file in that directory that
 * exports a `*Command` is registered, and each command declares its own
 * `aliases`. Adding a command is dropping in a file; removing one is deleting
 * that file. Nothing else needs editing — which also means no alias entry can
 * be left behind pointing at a command that no longer exists.
 *
 * The build must emit the command files individually — see `build:cli` in
 * package.json, which names the commands directory as an entrypoint glob.
 * Without that, the bundler inlines them and the directory is empty at runtime.
 */
export const registry = await createCommandRegistryFromDir(
  resolveCommandsDir({ from: import.meta.url }),
);
