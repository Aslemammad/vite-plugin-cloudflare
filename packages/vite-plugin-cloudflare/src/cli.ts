import path from "path";
import cac from "cac";
import { version } from "../package.json";

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
      const { build } = await import("vite");

      const outputDir = options.outputDir || path.dirname(input);

      const entries = { [options.outputFile || path.parse(input).name]: input };

      await build({
        configFile: false,
        plugins: [],
        mode: "production",
        // @ts-ignore
        // ssr: { noExternal: true },
        build: {
          emptyOutDir: false,
          outDir: path.join(root, outputDir),
          brotliSize: true,
          ssr: true,
          // minify: true,
          rollupOptions: {
            input: entries,
            output: {
              format: "esm",
            },
          },
          polyfillDynamicImport: false,
        },
      });
    }
  );

cli.help();
cli.parse();
