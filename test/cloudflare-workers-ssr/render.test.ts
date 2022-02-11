import type { Server } from "http";
import { describe, afterAll, beforeAll, expect, test } from "vitest";
import puppeteer from "puppeteer";
import { execaSync as execa } from "execa";
import { Miniflare } from "miniflare";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function autoRetry(test: () => void | Promise<void>): Promise<void> {
  const period = 100;
  const numberOfTries = 5000 / period;
  let i = 0;
  while (true) {
    try {
      await test();
      return;
    } catch (err) {
      i = i + 1;
      if (i > numberOfTries) {
        throw err;
      }
    }
    await sleep(period);
  }
}

describe("render", async () => {
  const url = "http://localhost:8787";
  let mf: Miniflare;

  let browser: puppeteer.Browser;
  let page: puppeteer.Page;
  let server: Server;
  beforeAll(async () => {
    execa("npm", ["run", "build"], { cwd: __dirname, stdio: "inherit" });
    mf = new Miniflare({
      scriptPath: "./dist/worker.js",
      wranglerConfigPath: true,
      packagePath: true,
      envPath: true,
    });
    browser = await puppeteer.launch();
    page = await browser.newPage();
    server = await mf.createServer();
    server.listen(8787);
  });
  afterAll(async () => {
    await browser.close();
    server.close();
  });

  test("page content is rendered to HTML", async () => {
    await page.goto(url);
    expect(await page.content()).toContain("<h1>Welcome</h1>");
  });

  test("page is rendered to the DOM and interactive", async () => {
    try {
      await page.goto(url);
      const h1Text = await (
        await page.$("h1")
      )?.evaluate((el) => el.textContent);
      expect(h1Text).toBe("Welcome");
      {
        const buttonText = await (
          await page.$("button")
        )?.evaluate((el) => el.textContent);
        expect(buttonText).toBe("Counter 0");
      }
      {
        await page.click("button");
        await sleep(100);
        const buttonText = await (
          await page.$("button")
        )?.evaluate((el) => el.textContent);
        expect(buttonText).toBe("Counter 1");
      }
    } catch (e) {
      console.error(e);
      expect(e).toBeUndefined();
    }
  });

  test("about page", async () => {
    await page.click('a[href="/about"]');

    autoRetry(async () => {
      const h1Text = await (
        await page.$("h1")
      )?.evaluate((el) => el.textContent);
      expect(h1Text).toBe("About");
    });
  });

  test("data fetching", async () => {
    await page.click('a[href="/star-wars"]');
    autoRetry(async () => {
      const h1Text = await (
        await page.$("h1")
      )?.evaluate((el) => el.textContent);
      expect(h1Text).toBe("Star Wars Movies");
    });

    const bodyText = await (
      await page.$("body")
    )?.evaluate((el) => el.textContent);
    expect(bodyText).toContain("The Phantom Menace");
  });
});
