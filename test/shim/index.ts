import { endianness } from "os";

addEventListener("fetch", (event) => {
  // @ts-ignore
  event.respondWith(handleRequest(event.request));
});

async function handleRequest() {
  const obj = {
    __dirname,
    __filename,
    cwd: process.cwd(),
    global: !!global,
    Buffer: !!Buffer,
    process: !!process,
    endianness: !!endianness,
    // TODO: Don't work properly
    XMLHttpRequest: !!XMLHttpRequest,
    XMLHttpRequestUpload: !!XMLHttpRequestUpload,
    XMLHttpRequestEventTarget: !!XMLHttpRequestEventTarget,
  };
  return new Response(JSON.stringify(obj));
}
