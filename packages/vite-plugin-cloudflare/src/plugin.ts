// import builtins from "rollup-plugin-node-builtins";
import { readFile } from "fs/promises";
import { builtinModules } from "module";
import { polyfillPath, polyfillGlobals } from "modern-node-polyfills";
import { fileURLToPath, resolve } from "mlly";
import { Plugin } from "esbuild";
import { dirname } from "path";

const isTS = (filename: string): boolean => /\.[cm]?ts$/.test(filename);

export const plugin: Plugin = {
  name: "vite-plugin-cloudflare",
  async setup(build) {
    build.onResolve({ filter: /.*/ }, async ({ path }) => {
      if (builtinModules.includes(path)) {
        return { path: await polyfillPath(path), sideEffects: false };
      }
    });

    build.onLoad({ filter: /\.[cm]?[jt]s$/ }, async ({ path }) => {
      const code = await readFile(path, "utf8");
      return {
        contents: await polyfillGlobals(code, {
          __dirname: dirname(path),
          __filename: path,
        }),
        loader: isTS(path) ? "ts" : "js",
      };
    });
  },
};
