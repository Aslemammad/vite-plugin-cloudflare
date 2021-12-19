addEventListener("fetch", (event) => {
  // @ts-ignore
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  return new Response('hello world');
}

