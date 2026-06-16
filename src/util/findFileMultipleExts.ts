import { isFile } from "./isFile.js";

export async function findFileMultipleExts(
  path: string,
  extensions: string[],
): Promise<string | undefined> {
  for (const ext of extensions) {
    const pathWithExt = `${path}.${ext}`;

    if (await isFile(pathWithExt)) {
      return pathWithExt;
    }
  }

  return undefined;
}
