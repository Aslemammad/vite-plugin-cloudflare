import { build as esbuild, BuildOptions } from "esbuild";
import { ESBuildOptions, ResolvedConfig } from "vite";
import { plugin } from "./plugin";
/* import path from "path";
import { readFile } from "fs/promises";
import { fileURLToPath, resolve } from "mlly";
import { plugin } from "./plugin"; */

export async function build(
  workerFile: string,
  dev: boolean,
  config: ResolvedConfig
) {
  const outFile = config.build.outDir + "/worker.js";
  const { rebuild, outputFiles } = await esbuild({
    ...(config.esbuild as BuildOptions),
    banner: {
      js: `
            (() => {
                globalThis.navigator = { userAgent: "Cloudflare-Workers" };
            })();
        `,
    },
    plugins: [plugin],
    incremental: dev,
    entryPoints: [workerFile],
    write: !dev,
    bundle: true,
    allowOverwrite: true,
    platform: "node",
    format: "esm",
    target: "es2020",
    outfile: outFile,
  });

  return { rebuild, content: outputFiles?.[0].text, outFile };
}
