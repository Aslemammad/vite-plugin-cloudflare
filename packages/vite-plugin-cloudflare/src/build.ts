import type { BuildOptions, BuildContext } from "esbuild";
import esbuild from "esbuild";
import { ResolvedConfig } from "vite";
import { plugin } from "./plugin";

export async function build(
  workerFile: string,
  dev: true,
  config: ResolvedConfig
): Promise<{
  outfile: string;
  content: string;
  dispose: () => Promise<void>;
  rebuild: BuildContext["rebuild"];
}>;

export async function build(
  workerFile: string,
  dev: false,
  config: ResolvedConfig
): Promise<{ outfile: string }>;

export async function build(
  workerFile: string,
  dev: boolean,
  config: ResolvedConfig
): Promise<
  | {
      outfile: string;
      content: string;
      dispose: () => Promise<void>;
      rebuild: BuildContext["rebuild"];
    }
  | { outfile: string }
> {
  const outFile = config.build.outDir + "/worker.js";
  const esbuildConfig: BuildOptions = {
    banner: {
      js: `
            (() => {
                globalThis.navigator = { userAgent: "Cloudflare-Workers" };
            })();
        `,
    },
    external: ["__STATIC_CONTENT_MANIFEST"],
    ...(config.esbuild as BuildOptions),
    sourcemap: 'inline',
    plugins: [plugin],
    entryPoints: [workerFile],
    write: !dev,
    bundle: true,
    allowOverwrite: true,
    platform: "node",
    format: "esm",
    target: "es2020",
    outfile: outFile,
  };
  if (dev) {
    const { rebuild, dispose } = await esbuild.context(esbuildConfig);
    const { outputFiles } = await rebuild();
    return {
      content: outputFiles![0].text,
      dispose,
      rebuild,
      outfile: outFile,
    };
  } else {
    await esbuild.build(esbuildConfig);
    return {
      outfile: outFile,
    };
  }
}
