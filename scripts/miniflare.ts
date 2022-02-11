import { installPackage } from "@antfu/install-pkg";

import glob from "fast-glob";

const workspaces = glob.sync(["./packages/**", "./test/**"], {
  onlyDirectories: true,
  deep: 1,
  absolute: true,
});

for (const workspace of workspaces) {
  process.chdir(workspace);

  installPackage("miniflare@" + process.argv[process.argv.length - 1], {
    silent: false,
  })
}
