import { endianness } from "os";
import { handleStaticAssets } from "./static-assets";

declare const DEBUG: boolean;

addEventListener("fetch", async (event) => {
  const { pathname } = new URL(event.request.url);
  if (pathname.startsWith("/api")) {
    event.respondWith(handleRequest(event.request));
    return;
  }
  if (DEBUG) {
    // we skip miniflare and let vite handle the url
    event.respondWith(new Response("", { headers: { "x-skip-request": "" } }));
  } else {
    // this will disable HMR in vite, so only for production
    event.respondWith(handleStaticAssets(event));
  }
});

async function handleRequest() {
  const obj = {
    "__dirname": __dirname,
    "__filename": __filename,
    cwd: process.cwd(),
    global: !!global,
    Buffer: !!Buffer,
    process: !!process,
    endianness: !!endianness
  };
  return new Response(JSON.stringify(obj));
}
