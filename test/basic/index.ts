import { handleRequest } from "./handle";

addEventListener("fetch", (event) => {
  // @ts-ignore
  event.respondWith(handleRequest(event.request));
});
