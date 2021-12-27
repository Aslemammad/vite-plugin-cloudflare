import esbuild from "esbuild";
import path from "path";
import { readFile } from "fs/promises";
import { fileURLToPath, resolve } from "mlly";
import { plugin } from "./plugin";

const root = process.cwd();
export async function build(
  options: Partial<esbuild.BuildOptions> & { outfile: string }
) {
  const shimFile = fileURLToPath(
    await resolve("vite-plugin-cloudflare/shimmed")
  );
  return await esbuild.build({
    banner: {
      js: `${await readFile(shimFile, "utf8")}\n
            globalThis.__filename = "${path.join(root, options.outfile)}";
            globalThis.__dirname = "${path.dirname(
              path.join(root, options.outfile)
            )}";

        `,
    },
    plugins: [plugin],
    platform: "node",
    outfile: options.outfile,
    format: "esm",
    loader: {},
    entryPoints: options.entryPoints,
    sourcemap: "inline",
    bundle: true,
    write: true,
    minify: true,
  });
}
