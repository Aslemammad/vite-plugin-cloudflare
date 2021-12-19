import path from "path";
import cac from "cac";
import { version } from "../package.json";

const cli = cac("vite-plugin-cloudflare");
const root = process.cwd();

cli
  .version(version)
  .command("build <input>", "build worker")
  .option("--outputDir <outputDir>", "output directory")
  .action(async (input: string, options: { outputDir?: string }) => {
    const { build } = await import("vite");
    const outputDir = options.outputDir || path.dirname(input);

    await build({
      mode: "production",
      // @ts-ignore
      ssr: { noExternal: true },
      optimizeDeps: {
        keepNames: undefined,
      },
      build: {
        outDir: path.join(root, outputDir),
        brotliSize: true,
        ssr: true,
        // minify: true,
        rollupOptions: {
          input,
          output: {
            format: "esm",
          },
        },
        polyfillDynamicImport: false,
      },
    });
  });

cli.help();
cli.parse();
