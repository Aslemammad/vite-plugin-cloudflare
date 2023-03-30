// ignore in typescript
// @ts-nocheck
import type { Connect, ResolvedConfig, PluginOption } from "vite";
import {
  Log,
  LogLevel,
  Miniflare,
  MiniflareOptions,
  RequestInit,
} from "miniflare";
import colors from "picocolors";
import path from "path";
import { fromResponse, toRequest } from "./utils";
import { build } from "./build";
import type { BuildContext } from "esbuild";
import { PolyfilledGlobals, PolyfilledModules } from "./plugin";
import fg from "fast-glob";

export type Options = {
  // miniflare specific options for development (optional)
  miniflare?: Omit<MiniflareOptions, "script" | "watch">;
  // the worker file (required)
  scriptPath: string;
  // customize globals that need to polyfilled (process, setTimeout, ...)
  polyfilledGlobals?: PolyfilledGlobals;
  // customize mods (node's builtinModules) that need to polyfilled (utils, http, ...)
  polyfilledModules?: PolyfilledModules;
  // a fast-glob pattern for files who's changes should reload the worker (optional)
  workerFilesPattern?: string | string[];
};

export default function vitePlugin(options: Options): PluginOption {
  let mf: Miniflare;
  let resolvedConfig: ResolvedConfig;
  let workerFile: string;
  let otherWorkerFiles: string[]
  let esbuildRebuild: BuildContext['rebuild'];
  return {
    enforce: "post",
    name: "cloudflare",
    configResolved(config) {
      resolvedConfig = config;
      workerFile = path.resolve(config.root, options.scriptPath);
      otherWorkerFiles = options.workerFilesPattern
        ? fg.sync(options.workerFilesPattern, {
            cwd: resolvedConfig.root,
            absolute: true,
          })
        : []
    },
    async configureServer(server) {
      const { rebuild, content, dispose } = await build(
        workerFile,
        true,
        resolvedConfig,
        options
      );
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
        dispose();
      });

      const mfMiddleware: Connect.NextHandleFunction = async (
        req,
        res,
        next
      ) => {
        try {
          const mfRequest = toRequest(req);

          // @ts-ignore
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

      return async () => {
        // enable HMR analyzing by vite, so we have better track of the worker
        // file (deps, importers, ...)
        try {
          // this may fail in custom server mode
          await server.transformRequest(workerFile);
        } catch {}
      };
    },
    async handleHotUpdate({ file, server }) {
      const module = server.moduleGraph.getModuleById(file);
      const isImportedByWorkerFile = [...(module?.importers || [])].some(
        (importer) => importer.file === workerFile
      );
      const isOtherWorkerFile = otherWorkerFiles.includes(file)

      if (module?.file === workerFile || isImportedByWorkerFile || isOtherWorkerFile) {
        const { outputFiles } = await esbuildRebuild();
        // @ts-ignore
        await mf.setOptions({ script: outputFiles![0].text });
        server.ws.send({ type: "full-reload" });
        server.config.logger.info(colors.cyan(`🔥 [cloudflare] hot reloaded`));
        // we already handle the reload, so we skip the Vite's HMR handling here
        return [];
      }
    },
    async closeBundle() {
      if (resolvedConfig.env.DEV) {
        return
      }
      const { outfile } = await build(workerFile, false, resolvedConfig, options);

      resolvedConfig.logger.info(
        colors.cyan(
          `🔥 [cloudflare] bundled worker file in '${path.relative(
            resolvedConfig.root,
            outfile
          )}'`
        )
      );
    },
  };
}
