declare global {
  var env: {
    ENVIRONMENT: string;
  }
}

export async function handleRequest() {
  return new Response('hello world, from ' + env.ENVIRONMENT + ' environment');
}

