import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { findFileMultipleExts } from "./util/findFileMultipleExts.js";

export const defaultExtensions = ["ts", "mts", "cts", "js", "mjs", "cjs"];

export const defaultGlobalPaths = [
  "~/.config/{app}",
  "~/.{app}/config",
  "~/.{app}",
  "/etc/{app}/config",
  "/etc/{app}",
];

export interface FindConfigOptions {
  /**
   * The working directory to start searching at (defaults to process.cwd()).
   */
  cwd?: string;
  /**
   * The allowed extensions (defaults to @see defaultExtensions).
   */
  extensions?: string[];
  /**
   * The global paths to search (defaults to @see defaultGlobalPaths). Set to []
   * to disable global paths. "~" will be expanded to the current user's homedir,
   * and "{app}" will be replaced with the app name.
   */
  globalPaths?: string[];
}

/**
 * Attempts to find a config file. Returns the path if one is found; otherwise,
 * undefined.
 * @param appName
 * @param options
 * @returns
 */
export async function findConfig(
  appName: string,
  options: FindConfigOptions = {},
): Promise<string | undefined> {
  const {
    cwd = process.cwd(),
    extensions = defaultExtensions,
    globalPaths = defaultGlobalPaths,
  } = options;

  let dir = cwd;

  // start at cwd and search upwards to / for the config file
  while (true) {
    const result =
      (await findFileMultipleExts(join(dir, appName), extensions)) ??
      (await findFileMultipleExts(join(dir, `.${appName}`), extensions));

    if (result) {
      return result;
    }

    const parent = resolve(dir, "..");

    if (parent === dir) {
      break;
    }

    dir = parent;
  }

  // nothing found yet, continue the search with global paths
  const home = homedir();

  const resolvedGlobalPaths = globalPaths.map((path) =>
    path.replace(/^~/, home).replace("{app}", appName),
  );

  for (const path of resolvedGlobalPaths) {
    const result = await findFileMultipleExts(path, extensions);

    if (result) {
      return result;
    }
  }

  // no configs found
  return undefined;
}
