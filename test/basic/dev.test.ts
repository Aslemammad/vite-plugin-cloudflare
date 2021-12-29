import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync } from "fs";
import { describe, afterAll, beforeAll, expect, test } from "vitest";
import puppeteer from "puppeteer";
import { execa } from "execa";
import { cp, rm } from "shelljs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function editFile(
  filename: string,
  replacer: (str: string) => string
): void {
  filename = resolve(__dirname, filename);
  const content = readFileSync(filename, "utf-8");
  const modified = replacer(content);
  writeFileSync(filename, modified);
}

describe("render", async () => {
  const url = "http://localhost:3000";

  let browser: puppeteer.Browser;
  let page: puppeteer.Page;
  // let server: Server;
  let devProcessKill = () => {};
  beforeAll(async () => {
    cp("./index.ts", "temp-index.ts");
    cp("./handle.ts", "temp-handle.ts");
    editFile("./temp-index.ts", (str) =>
      str.replace("./handle", "./temp-handle")
    );
    devProcessKill = execa(
      "pnpm",
      [
        "vite-plugin-cloudflare",
        "dev",
        "./temp-index.ts",
        "--port",
        "3000",
      ],
      { cwd: __dirname, stdio: "inherit" }
    ).cancel;
    await sleep(3000);

    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    devProcessKill();
    rm("-f", "./temp-index.ts");
    rm("-f", "./temp-handle.ts");
    await browser.close();
  });

  test("auto refresh", async () => {
    await page.goto(url);
    expect(await page.content()).toContain("hello world");

    editFile("./temp-handle.ts", (str) =>
      str.replace("hello world", "hello world 1")
    );
    await sleep(300)
    await page.reload()
    expect(await page.content()).toContain("hello world 1");

    editFile("./temp-handle.ts", (str) =>
      str.replace("hello world 1", "hello world 2")
    );
    await sleep(300)
    await page.reload()
    expect(await page.content()).toContain("hello world 2");
  });
});
