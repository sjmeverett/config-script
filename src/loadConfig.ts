import { pathToFileURL } from "node:url";
import { createJiti, type JitiOptions } from "jiti";
import { type FindConfigOptions, findConfig } from "./findConfig.js";
import { ConfigValidationError, type Schema } from "./util/validation.js";

export interface LoadConfigOptions extends FindConfigOptions {
  jiti?: JitiOptions;
}

export interface LoadConfigOptionsWithSchema<T> extends LoadConfigOptions {
  schema: Schema<T>;
}

export interface ResolvedConfig<T> {
  path: string;
  config: T;
}

export async function loadConfig(
  appName: string,
  options?: LoadConfigOptions,
): Promise<ResolvedConfig<unknown> | undefined>;
export async function loadConfig<T>(
  appName: string,
  options: LoadConfigOptionsWithSchema<T>,
): Promise<ResolvedConfig<T> | undefined>;
export async function loadConfig(
  appName: string,
  {
    cwd,
    extensions,
    globalPaths,
    schema,
    jiti: jitiOptions,
  }: LoadConfigOptions & { schema?: Schema<unknown> } = {},
): Promise<ResolvedConfig<unknown> | undefined> {
  const configPath = await findConfig(appName, {
    cwd,
    extensions,
    globalPaths,
  });

  if (!configPath) {
    return undefined;
  }

  const jiti = createJiti(pathToFileURL(configPath).href, jitiOptions);
  const config = await jiti.import<unknown>(configPath, { default: true });

  if (!schema) {
    return { path: configPath, config };
  }

  const result = schema.safeParse(config);

  if (!result.success) {
    throw new ConfigValidationError(configPath, result.error.issues);
  }

  return { path: configPath, config: result.data };
}
