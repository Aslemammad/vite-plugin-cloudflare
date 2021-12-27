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
  }
  return new Response(JSON.stringify(obj));
}

