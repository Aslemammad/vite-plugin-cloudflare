import esbuild from "esbuild";
import path from "path";
import cac from "cac";
import { version } from "../package.json";
import { plugin } from "./plugin";
import { resolve, fileURLToPath } from "mlly";
import { dirname } from "path";
import { readFile } from "fs/promises";

const cli = cac("vite-plugin-cloudflare");
const root = process.cwd();

cli
  .version(version)
  .command("build <input> <output>", "build worker")
  .action(async (input: string, output: string) => {
    const shimFile = fileURLToPath(
      await resolve("vite-plugin-cloudflare/shimmed")
    );
    await esbuild.build({
      banner: {
        js: `${await readFile(shimFile, "utf8")}\n
            globalThis.__filename = "${path.join(root, output)}";
            globalThis.__dirname = "${dirname(path.join(root, output))}";

        `,
      },
      plugins: [plugin],
      platform: "node",
      outfile: output,
      format: "esm",
      loader: {},
      entryPoints: [input],
      sourcemap: "inline",
      bundle: true,
      write: true,
      minify: true,
    });
  });

cli.help();
cli.parse();
