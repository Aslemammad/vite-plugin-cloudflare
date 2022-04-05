export async function handleRequest(request) {
  return new Response('hello world, from ' + env.ENVIRONMENT + ' environment');
}

