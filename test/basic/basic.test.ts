import { dirname } from "path";
import { fileURLToPath } from "url";
import { beforeEach, expect, test } from "vitest";
import { execaSync as execa } from "execa";
import { Miniflare } from "miniflare";

const __dirname = dirname(fileURLToPath(import.meta.url));

execa("npm", ["run", "build"], { cwd: __dirname, stdio: "inherit" });

let mf: Miniflare;

beforeEach(() => {
  mf = new Miniflare({
    scriptPath: "./dist/index.js",
  });
});

test("initial fetch", async () => {
  const res = await mf.dispatchFetch("http://localhost:8787");

  expect(await res.text()).toBe("hello world");
});
