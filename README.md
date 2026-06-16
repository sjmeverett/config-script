# config-script

An [`rc`](https://www.npmjs.com/package/rc)-style config loader for "active"
config files — config in JS/TS à la Vite and others. It searches for a config
script, loads it with [jiti](https://github.com/unjs/jiti) so that
`.ts`/`.mjs`/`.cjs` all just work, and returns the file's `default` export —
optionally validated by a [zod](https://zod.dev) schema with the type inferred
for you.

Now your config can build values from environment variables, load secrets from
secure places, configure hooks and plugins, etc!

```ts
import { loadConfig } from "config-script";
import { z } from "zod";

const configSchema = z.object({
  port: z.number().default(3000),
  db: z.object({ url: z.string().url() }),
});

// `config` is typed as { port: number; db: { url: string } } | undefined
const config = await loadConfig("myapp", { schema: configSchema });
```

And the config file itself (`myapp.config.ts`, `.myapp.ts`, `~/.config/myapp.ts`, …):

```ts
// .myapp.ts
export default {
  port: 8080,
  db: { url: process.env.DATABASE_URL ?? "postgres://localhost/myapp" },
};
```

## Install

```sh
npm install config-script
# zod is an optional peer dependency — only needed if you pass a schema
npm install zod
```

## Search order

For app `myapp`, candidates are tried in this order and the first existing
file wins (local config > user config > system config):

1. `(.)myapp.{ts,mts,cts,js,mjs,cjs}` — starting in the current directory and
   walking up to the filesystem root (both `myapp.ts` and `.myapp.ts` at each level)
2. `~/.config/myapp.<ext>`
3. `~/.myapp/config.<ext>`
4. `~/.myapp.<ext>`
5. `/etc/myapp/config.<ext>`
6. `/etc/myapp.<ext>`

Extensions are tried in the order `ts, mts, cts, js, mjs, cjs` and are
configurable via the `extensions` option.

## API

### `loadConfig(appName, options?)`

Returns the default export of the first config found and the path it was found
at (`{ config, path }`), or `undefined` if none exists. With `schema`, the
return type is inferred from the schema and the value is validated.

### `findConfig(appName, options?)`

Used by `loadConfig` internally and exposed for convenience: returns the path of
the first config found, without loading it.
