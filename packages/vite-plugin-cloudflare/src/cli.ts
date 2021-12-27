import esbuild from "esbuild";
import path from "path";
import cac from "cac";
import c from "picocolors";
import { version } from "../package.json";
import { plugin } from "./plugin";
import { resolve, fileURLToPath } from "mlly";
import { dirname } from "path";
import { readFile } from "fs/promises";
import { createServer, ViteDevServer } from "vite";
import { build } from "./build";

const cli = cac("vite-plugin-cloudflare");
const root = process.cwd();

cli
  .command("build <input> <output>", "build worker")
  .action(async (input: string, output: string) => {
    try {
      console.log(c.green(`Building ${c.bold(input)}`));

      await build({
        outfile: output,
        entryPoints: [input],
      });

      console.log(c.green(`Built ${c.bold(output)}`));
    } catch (e) {
      console.error(c.red("Failed to build. \n" + String(e)));
      process.exit(1);
    }
  });

cli
  .command("dev <input> <output>")
  .action(async (input: string, output: string) => {
    console.log("hello");
    let server: ViteDevServer;
    try {
      server = await createServer({
        root: process.cwd(),
        mode: "dev",

        server: {
          watch: {},
          hmr: true,
        },
        plugins: [
          {
            name: "vite-plugin-cloudflare",
            handleHotUpdate({ file }) {
              console.log("here", file);
            },
          },
        ],
      });

      server.listen(3000);
    } catch (e: any) {}
  });

cli.version(version);
cli.help();
cli.parse();
