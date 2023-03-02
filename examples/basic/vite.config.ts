import { defineConfig } from "vite";
import vpc from "vite-plugin-cloudflare";

export default defineConfig({
  esbuild: {
    define: {
      DEBUG: `${process.env.NODE_ENV === "development"}`,
    }
  },
  plugins: [vpc({ scriptPath: "./worker/index.ts", polyfilledGlobals: { process: 'process/browser', Buffer: null} })],
});
