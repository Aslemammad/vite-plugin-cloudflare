declare global {
  var ENVIRONMENT: string;
}

export async function handleRequest() {
  return new Response("hello world, from " + ENVIRONMENT + " environment");
}
