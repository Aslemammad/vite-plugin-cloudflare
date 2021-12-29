import builtins from "rollup-plugin-node-builtins";
import { Plugin } from "esbuild";

export const plugin: Plugin = {
  name: "vite-plugin-cloudflare",
  setup(build) {
    const resolveBuiltins = builtins().resolveId!.bind(null as any) as (
      importee: string
    ) => string | undefined;

    build.onResolve({ filter: /.*/ }, ({ path, namespace }) => {
      const newPath = resolveBuiltins(path);
      if (newPath) {
        return { path: newPath, namespace };
      }
    });
    build.onResolve(
      {
        filter: /\?(raw)\b/,
      },
      ({ path }) => ({ path, external: true })
    );
  },
};
