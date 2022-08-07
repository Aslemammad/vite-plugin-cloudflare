addEventListener("fetch", (event) => {
  console.log(process.env.NODE_ENV);
  try {
    event.respondWith(
      handleFetchEvent(event).catch((err) => {
        console.error(err.stack);
      })
    );
  } catch (err) {
    console.error(err.stack);
    event.respondWith(new Response("Internal Error", { status: 500 }));
  }
});

async function handleFetchEvent(event) {
  const { handleSsr } = await import("./ssr");
  const { handleStaticAssets } = await import("./static-assets");
  if (!isAssetUrl(event.request.url)) {
    const response = await handleSsr(event.request.url);
    if (response !== null) return response;
  }
  const response = await handleStaticAssets(event);
  return response;
}

function isAssetUrl(url) {
  const { pathname } = new URL(url);
  return pathname.startsWith("/assets/");
}
