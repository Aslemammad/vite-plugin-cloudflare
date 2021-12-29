import esbuild from "esbuild";
import path from "path";
import { readFile } from "fs/promises";
import { fileURLToPath, resolve } from "mlly";
import { plugin } from "./plugin";

const root = process.cwd();
export async function build(options: {
  output: string;
  input: string;
  incremental: boolean;
  debug: boolean;
}) {
  const shimFile = fileURLToPath(
    await resolve("vite-plugin-cloudflare/shimmed")
  );
  return await esbuild.build({
    outfile: options.output,
    entryPoints: [options.input],
    incremental: options.incremental,
    logLevel: options.debug ? "debug" : "info",
    external: ["__STATIC_CONTENT_MANIFEST"],
    loader: { ".html": "text" },
    banner: {
      // TODO: __filename should be /worker.js or output name, and not sysytem path
      js: `${await readFile(shimFile, "utf8")}\n
            globalThis.__filename = "${path.join(root, options.output)}";
            globalThis.__dirname = "${path.dirname(
              path.join(root, options.output)
            )}";

        `,
    },
    plugins: [plugin],
    platform: "node",
    format: "esm",
    target: "es2020",
    bundle: true,
    write: true,
    minify: true,
  });
}
