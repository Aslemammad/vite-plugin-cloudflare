import globals from "rollup-plugin-node-globals";
import builtins from "rollup-plugin-node-builtins";
import { Plugin } from "esbuild";

export const plugin: Plugin = {
  name: "vite-plugin-cloudflare",
  setup(build) {
    // const loadGlobals = globals().load! as (id: string) => string | undefined;
    // const resolveGlobals = globals().resolveId! as (
    //   importee: string, importer: string
    // ) => string | undefined;
    // const transformGlobals = globals().transform! as (
    //   code: string,
    //   id: string
    // ) => { code: string; map: string | null } | undefined | null;
    //
    const resolveBuiltins = builtins().resolveId!.bind(null as any) as (
      importee: string
    ) => string | undefined;

    // // rollup-plugin-node-globals resolveId
    // build.onResolve({ filter: /.*/ }, ({ path, namespace, importer }) => {
    //   const newPath = resolveGlobals(path, importer);
    //   if (newPath) {
    //     console.log('globals', path, newPath);
    //     return { path: newPath, namespace };
    //   }
    // });
    // build.onLoad({filter: /.*/}, ({}) => {
    //
    // })
    build.onResolve({ filter: /.*/ }, ({ path, namespace }) => {
      const newPath = resolveBuiltins(path);
      if (newPath) {
        return { path: newPath, namespace };
      }
    });
  },
};
