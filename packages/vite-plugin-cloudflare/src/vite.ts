import type { Plugin, Connect, ResolvedConfig } from "vite";
import {
  Log,
  LogLevel,
  Miniflare,
  MiniflareOptions,
  RequestInit,
} from "miniflare";
// import { build, BuildInvalidate, BuildOptions } from "esbuild";
import colors from "picocolors";
import path from "path";
import { fromResponse, toRequest } from "./utils";
import { build } from "./build";
import { BuildInvalidate } from "esbuild";

type Options = {
  miniflare?: Omit<MiniflareOptions, "script" | "watch">;
  scriptPath: string;
};

export default function vitePlugin(options: Options): Plugin {
  let mf: Miniflare;
  let resolvedConfig: ResolvedConfig;
  let workerFile: string;
  let esbuildRebuild: BuildInvalidate;
  return {
    enforce: "post",
    name: "cloudflare",
    configResolved(config) {
      resolvedConfig = config;
      workerFile = path.resolve(config.root, options.scriptPath);
    },
    async configureServer(server) {
      const { rebuild, content } = await build(
        workerFile,
        true,
        resolvedConfig
      );
      /* const { rebuild, outputFiles } = await build({
        ...server.config.esbuild as BuildOptions,
        banner: {
          js: `
            (() => {
                globalThis.navigator = { userAgent: "Cloudflare-Workers" };
            })();
        `,
        },
        plugins: [plugin],
        incremental: true,
        entryPoints: [workerFile],
        write: false,
        bundle: true,
        platform: "node",
        format: "esm",
        target: "es2020",
      }); */
      esbuildRebuild = rebuild!;

      mf = new Miniflare({
        log: new Log(LogLevel.DEBUG),
        sourceMap: true,
        wranglerConfigPath: true,
        packagePath: false,
        ...options.miniflare,
        script: content,
        watch: true,
      });

      process.on("beforeExit", async () => {
        await mf.dispose();
        esbuildRebuild?.dispose();
      });

      return async () => {
        // enable HMR analyzing by vite, so we have better track of the worker
        // file (deps, importers, ...)
        await server.transformRequest(workerFile);

        const mfMiddleware: Connect.NextHandleFunction = async (
          req,
          res,
          next
        ) => {
          try {
            const mfRequest = toRequest(req);

            const mfResponse = await mf.dispatchFetch(
              mfRequest.url,
              mfRequest as RequestInit
            );

            if (mfResponse.headers.has("x-skip-request")) {
              throw undefined; // skip miniflare and pass to next middleware
            }

            await fromResponse(mfResponse, res);
          } catch (e) {
            if (e) {
              console.error(e);
            }
            next(e);
          }
        };

        server.middlewares.use(mfMiddleware);
      };
    },
    async handleHotUpdate({ file, server }) {
      const module = server.moduleGraph.getModuleById(file);
      const isImportedByWorkerFile = [...(module?.importers || [])].some(
        (importer) => importer.file === workerFile
      );

      if (module?.file === workerFile || isImportedByWorkerFile) {
        const { outputFiles } = await esbuildRebuild();
        await mf.setOptions({ script: outputFiles![0].text });
        server.ws.send({ type: "full-reload" });
        server.config.logger.info(colors.cyan(`🔥 [cloudflare] hot reloaded`));
        // we already handle the reload, so we skip the Vite's HMR handling here
        return [];
      }
    },
    async closeBundle() {
      const { outFile } = await build(workerFile, false, resolvedConfig);

      resolvedConfig.logger.info(
        colors.cyan(
          `🔥 [cloudflare] bundled worker file in '${path.relative(
            resolvedConfig.root,
            outFile
          )}'`
        )
      );
    },
  };
}