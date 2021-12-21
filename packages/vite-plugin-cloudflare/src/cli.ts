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
  .command("build <input>", "build worker")
  .option("--outputDir <outputDir>", "output directory")
  .option("--outputFile <outputDir>", "output file name without extension")
  .action(
    async (
      input: string,
      options: { outputDir?: string; outputFile?: string }
    ) => {
      const outputDir = options.outputDir || path.dirname(input);
      console.log(esbuild.build);

      const outFile = path.join(outputDir, options.outputFile || path.parse(input).name) + '.js'
      await esbuild.build({
        banner: {
          js: getShim(path.join(root, outputDir, (options.outputFile || '') + '.js')),
        },
        plugins: [plugin],
        platform: "node",
        outfile: outFile,
        format: "esm",
        entryPoints: [input],
        // treeShaking: true,
        sourcemap: "inline",
        bundle: true,
        write: true,
        // plugins: [moduleLoader],
      });
      await esbuild.build({
        allowOverwrite: true,
        plugins: [plugin],
        platform: "node",
        outfile: outFile,
        format: "esm",
        entryPoints: [outFile],
        // treeShaking: true,
        sourcemap: "inline",
        bundle: true,
        write: true,
        // plugins: [moduleLoader],
      });
    }
  );

cli.help();
cli.parse();
