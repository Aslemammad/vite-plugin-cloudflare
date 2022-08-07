import react from "@vitejs/plugin-react";
import ssr from "vite-plugin-ssr/plugin";
import vpc from "vite-plugin-cloudflare";

export default {
  plugins: [react(), ssr(), vpc({ scriptPath: "./worker/index.js" })],
};
