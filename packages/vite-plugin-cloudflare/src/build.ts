import esbuild from "esbuild";
import path from "path";
import { readFile } from "fs/promises";
import { fileURLToPath, resolve } from "mlly";
import { plugin } from "./plugin";

export async function build(options: {
  output: string;
  input: string;
  incremental: boolean;
  debug: boolean;
  minify: boolean;
  sourcemap: boolean;
}) {
  const shimFile = fileURLToPath(
    await resolve("vite-plugin-cloudflare/shimmed")
  );

  return await esbuild.build({
    sourcemap: options.sourcemap,
    outfile: options.output,
    entryPoints: [options.input],
    incremental: options.incremental,
    minify: options.minify,
    logLevel: options.debug ? "debug" : "info",
    external: ["__STATIC_CONTENT_MANIFEST"],
    banner: {
      // TODO: do transformation like rollup-plugin-node-globals and not injecting
      js: `
            (() => {
              ${await readFile(shimFile, "utf8")}\n
            })()
            globalThis.__filename = "${path.join("/", options.output)}";
            globalThis.__dirname = "/";

        `,
    },
    plugins: [plugin],
    platform: "node",
    format: "esm",
    target: "es2020",
    bundle: true,
    write: true,
    allowOverwrite: true,
  });
}
