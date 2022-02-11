# vite-plugin-cloudflare 🔥

[![Discord](https://img.shields.io/discord/815937377888632913.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/Rhg9cEghMF)

Vite-plugin-cloudflare is a software for transforming & bundling cloudflare workers with shimming [node globals](https://github.com/calvinmetcalf/rollup-plugin-node-globals) and [builtins](https://github.com/calvinmetcalf/rollup-plugin-node-builtins/)  like `process`, `os`, `stream` and plenty of other node functions and modules using **Esbuild** and **Vite**!

- ⚡ Lightning builds
- 💥 Workers compatible build using shimming
- 🔥 Fast development incremental reloads
- ✏️ Easy simulation using [Miniflare](https://miniflare.dev/) 

## Install
```
npm install -D vite-plugin-cloudflare
```
 
 ## Build
 ```
 vite-plugin-cloudflare build input.ts worker.js 
 # or 
 vpc build input.ts worker.js 
 ```
 Now you can upload or use the `worker.js` file as your cloudflare worker file.
 
 ## Development
 ```
  vpc dev input.ts 
 ```

Here you can navigate to `localhost:3000` and see the output of your worker. With every change to the related files, Esbuild is going to rebuild incrementally through the Vite server, then Miniflare reloads the script so you can check the new results by refreshing your browser or reloading your client.

![image_2021-12-28_22-53-23](https://user-images.githubusercontent.com/37929992/147600217-e2d632cb-78d1-45d8-86cc-081fee8e8f64.png)

## More
For seeing more options:
```
vpc -h
```
And more examples in [test/](https://github.com/Aslemammad/vite-plugin-cloudflare/tree/main/test).

## New features

- `?raw` support like vitejs
- `__STATIC_CONTENT_MANIFEST` as external

## Credits
[Brillout](https://github.com/brillout/)

[Viteflare](https://github.com/alloc/viteflare)

[Cloudflare](https://workers.cloudflare.com/)

[Miniflare](http://miniflare.dev/)

[Vitest](https://github.com/vitest-dev/vitest)

[Node-builtins](https://github.com/calvinmetcalf/rollup-plugin-node-builtins)

[Cac](https://www.npmjs.com/package/cac#display-help-message-and-version)
