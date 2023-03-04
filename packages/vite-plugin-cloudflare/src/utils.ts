import { Request, Response } from "undici";
import { ServerResponse } from "http";
import { Connect } from "vite";

export function toRequest(req: Connect.IncomingMessage): Request {
  const url = new URL(req.url || req.originalUrl!, `http://localhost:8787`);

  return new Request(url.href, {
    headers: req.headers as Record<string, string>,
    method: req.method,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : req,
    duplex: "half"
  });
}

export async function fromResponse(response: Response, res: ServerResponse) {
  /*
Copyright 2021 Fatih Aygün and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
  res.statusCode = response.status;
  for (const [key, value] of response.headers) {
    if (key === "set-cookie") {
      const setCookie = response.headers.get("set-cookie") as string;
      res.setHeader("set-cookie", setCookie);
    } else {
      res.setHeader(key, value);
    }
  }

  const contentLengthSet = response.headers.get("content-length");
  if (response.body) {
    if (contentLengthSet) {
      for await (let chunk of response.body as any) {
        chunk = Buffer.from(chunk);
        res.write(chunk);
      }
    } else {
      const reader = (response.body as any as AsyncIterable<Buffer | string>)[
        Symbol.asyncIterator
      ]();

      const first = await reader.next();
      if (first.done) {
        res.setHeader("content-length", "0");
      } else {
        const secondPromise = reader.next();
        let second = await Promise.race([secondPromise, Promise.resolve(null)]);

        if (second && second.done) {
          res.setHeader("content-length", first.value.length);
          res.write(first.value);
        } else {
          res.write(first.value);
          second = await secondPromise;
          for (; !second.done; second = await reader.next()) {
            res.write(Buffer.from(second.value));
          }
        }
      }
    }
  } else if (!contentLengthSet) {
    res.setHeader("content-length", "0");
  }

  res.end();
}
