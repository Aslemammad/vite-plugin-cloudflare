import { endianness } from "os";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from 'fs/promises'
import { beforeEach, expect, test } from "vitest";
import { execaSync as execa } from "execa";
import { Miniflare } from "miniflare";

const __dirname = dirname(fileURLToPath(import.meta.url));

execa("npm", ["run", "build"], { cwd: __dirname, stdio: "inherit" });

let mf: Miniflare;

beforeEach(() => {
  mf = new Miniflare({
    scriptPath: "./dist/worker.js",
  });
});

test("basic", async () => {
  const res = await mf.dispatchFetch("http://localhost:8787/api");
  const body = await res.text();

  const obj = {
    __dirname: expect.any(String),
    __filename: expect.any(String),
    cwd: expect.any(String),
    global: !!global,
    Buffer: false, // disabled in vite.config.ts
    process: !!process,
    endianness: !!endianness,
    /* XMLHttpRequest: true,
    XMLHttpRequestUpload: true,
    XMLHttpRequestEventTarget: true, */
  };

  expect(JSON.parse(body)).toStrictEqual(obj);

  // custom util polyfill
  expect(await fs.readFile('./dist/worker.js', 'utf-8')).toContain('util/util.js')
});
