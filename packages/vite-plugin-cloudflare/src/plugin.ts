import builtins from "rollup-plugin-node-builtins";
import { readFile } from "fs/promises";
import { fileURLToPath, resolve } from "mlly";
import { Plugin } from "esbuild";

export const plugin: Plugin = {
  name: "vite-plugin-cloudflare",
  async setup(build) {
    const resolveBuiltins = builtins({
      crypto: true,
      fs: true,
    }).resolveId!.bind(null as any) as (importee: string) => string | undefined;

    build.onResolve({ filter: /.*/ }, async ({ path, namespace }) => {
      const newPath = resolveBuiltins(path);
      if (newPath) {
        if (/(process-es6|buffer-es6)/.test(newPath)) {
          return { path: newPath, namespace: "polyfill" };
        }
        return { path: newPath, namespace };
      }
    });
    const BufferContent = await readFile(
      fileURLToPath(await resolve("vite-plugin-cloudflare/Buffer")),
      "utf8"
    );
    const processContent = await readFile(
      fileURLToPath(await resolve("vite-plugin-cloudflare/process")),
      "utf8"
    );

    build.onLoad({ filter: /.*/, namespace: "polyfill" }, async ({ path }) => {
      if (/process-es6/.test(path)) {
        return {
          contents: processContent,
        };
      }
      if (/buffer-es6/.test(path)) {
        return {
          contents: BufferContent,
        };
      }
      return;
    });

    build.onResolve({ filter: /\?raw/ }, async ({ path }) => {
      return { path, namespace: "text" };
    });

    build.onLoad(
      {
        filter: /.*/,
        namespace: "text",
      },
      async ({ path }) => {
        return {
          loader: "text",
          contents: await readFile(path.replace("?raw", ""), "utf-8"),
        };
      }
    );
  },
};
