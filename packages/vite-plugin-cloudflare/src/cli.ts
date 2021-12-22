import esbuild from "esbuild";
import path from "path";
import cac from "cac";
import { version } from "../package.json";
import { plugin } from "./plugin";
import { getShim } from "./shim";

const cli = cac("vite-plugin-cloudflare");
const root = process.cwd();

cli
  .version(version)
  .command("build <input> <output>", "build worker")
  .action(
    async (
      input: string,
      output: string,
    ) => {
      await esbuild.build({
        banner: {
          js: getShim(path.join(root, output)),
        },
        plugins: [plugin],
        platform: "node",
        outfile: output,
        format: "esm",
        loader:{},
        entryPoints: [input],
        sourcemap: "inline",
        bundle: true,
        write: true,
        minify: true
      });

      await esbuild.build({
        allowOverwrite: true,
        plugins: [plugin],
        platform: "node",
        outfile: output,
        format: "esm",
        entryPoints: [output],
        sourcemap: "inline",
        bundle: true,
        write: true,
        minify: true
      });
    }
  );

cli.help();
cli.parse();
