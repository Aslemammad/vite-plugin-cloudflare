# vite-plugin-cloudflare 🔥

Vite-plugin-cloudflare is a plugin for transforming & bundling cloudflare
workers with shimming [modern node
polyfills](https://github.com/Aslemammad/modern-node-polyfills) like `process`,
`os`, `stream` and other node global functions and modules using **Esbuild** and **Vite**!

- Universal Vite plugin
- Lightning builds
- Workers compatible build using shimming
- Fast development incremental and HMR compatible reloads
- Builtin [Miniflare](https://miniflare.dev/) support

## Install

```
npm i --save-dev vite-plugin-cloudflare
```

## Plugin

```ts
// vite.config.js
import { defineConfig } from "vite";
import vpc from "vite-plugin-cloudflare";

export default defineConfig({
  plugins: [vpc({ scriptPath: "./worker/index.ts" })],
});
```

The plugin gets an options object with this type signature.

```ts
type Options = {
  // miniflare specific options for development (optional)
  miniflare?: Omit<MiniflareOptions, "script" | "watch">;
  // the worker file (required)
  scriptPath: string;
};
```
Since this plugin works with Esbuild, options passed to the `esbuild` field of
your vite plugin will affect the worker result, unless they are not compatible
with the `BuildOptions` type of Esbuild.

## Development

You can start your Vite dev server and continue developing your applications. As
previously mentioned, this plugin integrates Miniflare with Vite, so you'd have
a nice experience writing your workers.

```
 vite dev
```

## Build

When building, the plugin is going to start bundling your worker at the end of
the vite bundling phase and generates it into the `config.outDir` with the
`worker.js` file name.

```
 vite build
```

Output:

```
vite v3.0.4 building for production...
✓ 6 modules transformed.
dist/assets/typescript.f6ead1af.svg   1.40 KiB
dist/index.html                       0.44 KiB
dist/assets/index.2547d205.js         1.41 KiB / gzip: 0.72 KiB
dist/assets/index.d0964974.css        1.19 KiB / gzip: 0.62 KiB
🔥 [cloudflare] bundled worker file in 'dist/worker.js'
```

## Wrangler

Update your wrangler config to be compatible with the build, for instance,
here's a config that uses the `dist/worker.js` bundled worker file generated by
vite-plugin-cloudflare and serves the assets from the vite build:

```toml
# wrangler.toml
name = "vite-ssr-worker"
main = "./dist/worker.js"
compatibility_date = "2022-08-10"

[site]
# The directory containing your static assets.
# It must be a path relative to your `wrangler.toml` file.
# If there is a `site` field then it must contain this `bucket` field.
bucket = "./dist/client"
```

## Skip Requests

Vite has some builtin middlewares that handle different types of requests from the
client, and in a Vite plugin, we can inject our middlewares along
vite ones.

Vite-plugin-cloudflare injects a middleware, that is responsible for handling
the worker, So every request from the client (browser) may come to your worker
first, before vite native middlewares. These requests can be assets,
transforms and other types of vite-related requests that should not be handled by
vite-plugin-cloudflare and instead, they should be handled by vite.

> This concern only occurs in dev mode, so no worries when building for production

Here's how we handle these type of requests in vite-plugin-cloudflare.

```ts
addEventListener("fetch", (event) => {
  const { pathname } = new URL(url);
  if (pathname.startsWith("/api")) {
    event.respondWith(handleFetchEvent(event));
    return;
  }
  event.respondWith(
    new Response("", {
      headers: {
        "x-skip-request": "",
      },
    })
  );
});
```

The `x-skip-request` header enforces vite-plugin-cloudflare to skip the response of the worker and passes the
request to the next vite middleware, so Vite would handle the request instead.

## Authors

| <a href="https://github.com/Aslemammad"> <img width='150' src="https://avatars.githubusercontent.com/u/37929992?v=4" /><br> Mohammad Bagher </a> |
| ------------------------------------------------------------------------------------------------------------------------------------------------ |

## Contributing

Feel free to create issues/discussions and then PRs for the project!
