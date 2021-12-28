import { join } from "path";
import cac from "cac";
import c from "picocolors";
import { version } from "../package.json";
import { createServer, ViteDevServer, Plugin } from "vite";
import { build } from "./build";
import { ConsoleLog, Miniflare } from "miniflare";

const cli = cac("vite-plugin-cloudflare");

cli
  .command("build <input> <output>", "build worker")
  .option("-d, --debug", "enable debugging", { default: false })
  .action(
    async (input: string, output: string, options: { debug: boolean }) => {
      try {
        console.log(`Building ${c.cyan(c.bold(input))}`);

        await build({
          output,
          input,
          incremental: false,
          debug: options.debug,
        });

        console.log(`Built ${c.cyan(c.bold(output))}`);
      } catch (e) {
        console.error(c.red("Failed to build. \n" + String(e)));
        process.exit(1);
      }
    }
  );

cli
  .command("dev <input> <output>")
  .option("-p, --port <input>", "miniflare port", { default: 3000 })
  .option("-d, --debug", "enable debugging", { default: false })
  .action(
    async (
      input: string,
      output: string,
      options: { port: number; debug: boolean }
    ) => {
      const { rebuild } = await build({
        output,
        input,
        incremental: true,
        debug: options.debug,
      });
      console.log(`Built ${c.cyan(c.bold(output))}`);

      let server: ViteDevServer;
      const miniflare = new Miniflare({
        watch: true,
        port: options.port,
        log: options.debug ? new ConsoleLog(true) : false,
      });

      try {
        miniflare.createServer().listen(options.port);

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
                await miniflare.reloadOptions();
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
      } catch (e: any) {}
      process.on("beforeExit", () => {
        rebuild?.dispose();
        miniflare.dispose();
      });
    }
  );

cli.version(version);
cli.help();
cli.parse();
