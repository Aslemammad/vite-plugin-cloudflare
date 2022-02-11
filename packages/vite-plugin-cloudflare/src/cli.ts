import { join } from "path";
import cac from "cac";
import c from "picocolors";
import { version } from "../package.json";
import { createServer, ViteDevServer, Plugin } from "vite";
import { build } from "./build";
import { Miniflare } from "miniflare";
import { unlink } from "fs/promises";
import { BuildOptions, DevOptions } from "./types";

const cli = cac("vite-plugin-cloudflare");

cli
  .command("build <input> <output>", "build worker")
  .option("-d, --debug", "enable debugging", { default: false })
  .option("-m, --minify", "enable minification", { default: false })
  .option("--sourcemap", "enable sourcemaps", { default: false })
  .option("-c, --wrangler-config", "enable wrangler-config", { default: false })
  .option("--env", "enable env path", { default: false })
  .option("--package", "enable package", { default: false })
  .action(async (input: string, output: string, options: BuildOptions) => {
    try {
      console.log(`Building ${c.cyan(c.bold(input))}`);

      await build({
        sourcemap: options.sourcemap,
        output,
        input,
        incremental: false,
        debug: options.debug,
        minify: options.minify,
      });

      console.log(`Built ${c.cyan(c.bold(output))}`);
    } catch (e) {
      console.error(c.red("Failed to build. \n" + String(e)));
      process.exit(1);
    }
  });

cli
  .command("dev <input>")
  .option("-p, --port <input>", "miniflare port", { default: 3000 })
  .option("-d, --debug", "enable debugging", { default: false })
  .option("-m, --minify", "enable minification", { default: false })
  .option("--sourcemap", "enable sourcemaps", { default: false })
  .option("--wrangler-config", "load wrangler config automatically", { default: true })
  .option("--env", "load env automatically", { default: true })
  .option("--package", "load package.json automatically", { default: true })
  .action(async (input: string, options: DevOptions) => {
    const output = ".vpc/dev.js";
    const { rebuild } = await build({
      sourcemap: options.sourcemap,
      output,
      input,
      incremental: true,
      debug: options.debug,
      minify: options.minify,
    });
    console.log(`Built ${c.cyan(c.bold(input))} in ${c.cyan(c.bold(output))}`);

    let server: ViteDevServer;
    const miniflare = new Miniflare({
      watch: true,
      port: options.port,
      scriptPath: output,
      sourceMap: options.sourcemap,
      wranglerConfigPath: options.wranglerConfigPath,
      packagePath: options.packagePath,
      envPath: options.envPath,
      // log: options.debug ? new ConsoleLog(true) : false,
    });

    try {
      const mfServer = await miniflare.createServer();
      mfServer.listen(options.port);

      const root = process.cwd();
      server = await createServer({
        root,
        mode: "dev",
        logLevel: options.debug ? "info" : "silent",
        server: {
          hmr: true,
        },
        plugins: [
          {
            name: "vite-plugin-cloudflare",
            async handleHotUpdate({ file }) {
              if (file === join(root, output)) {
                return;
              }
              const start = performance.now();
              await rebuild?.();
              if ("reloadOptions" in miniflare) {
                // @ts-ignore
                await miniflare?.reloadOptions();
              } else if ("reload" in miniflare) {
                // @ts-ignore
                await miniflare?.reload();
              }
              console.log(
                `Reloading ${c.cyan(c.bold(file))}`,
                c.gray(`${(performance.now() - start).toFixed(2)}ms`)
              );
            },
          } as Plugin,
        ],
      });

      await server.listen();
      console.log(
        `Listening on ${c.cyan(
          `http://localhost:${options.port}`
        )} for Miniflare, ${c.cyan(
          `http://localhost:${server.config.server.port}`
        )} for Vite`
      );
    } catch (e: any) {
      console.error(c.red("Failed to start. \n" + String(e)));
      process.exit(1);
    }
    process.on("beforeExit", async () => {
      rebuild?.dispose();
      miniflare.dispose();
      if (!options.debug) {
        await unlink(output);
      }
    });
  });

cli.version(version);
cli.help();
cli.parse();
