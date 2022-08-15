import { endianness } from "os";

addEventListener("fetch", (event) => {
  const { pathname } = new URL(event.request.url);
  if (pathname.startsWith("/api")) {
    event.respondWith(handleRequest(event.request));
    return;
  }
  // we skip miniflare and let vite handle the url
  event.respondWith(new Response("", { headers: { "x-skip-request": "" } }));
});

async function handleRequest() {
  const obj = {
    __dirname: __dirname,
    __filename: __filename,
    cwd: process.cwd(),
    global: !!global,
    Buffer: !!Buffer,
    process: !!process,
    endianness: !!endianness,
    // TODO: Don't work properly
    /* XMLHttpRequest: !!XMLHttpRequest,
    XMLHttpRequestUpload: !!XMLHttpRequestUpload,
    XMLHttpRequestEventTarget: !!XMLHttpRequestEventTarget, */
  };
  return new Response(JSON.stringify(obj));
}
