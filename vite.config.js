import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "../grv/node_modules/vite/dist/node/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sharedNodeModules = path.resolve(__dirname, "../grv/node_modules");

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: [
      {
        find: /^react\/jsx-runtime$/,
        replacement: path.resolve(sharedNodeModules, "react/jsx-runtime.js"),
      },
      {
        find: /^react\/jsx-dev-runtime$/,
        replacement: path.resolve(sharedNodeModules, "react/jsx-dev-runtime.js"),
      },
      {
        find: /^react-dom\/client$/,
        replacement: path.resolve(sharedNodeModules, "react-dom/client.js"),
      },
      {
        find: /^react-dom$/,
        replacement: path.resolve(sharedNodeModules, "react-dom/index.js"),
      },
      {
        find: /^react$/,
        replacement: path.resolve(sharedNodeModules, "react/index.js"),
      },
      {
        find: /^scheduler$/,
        replacement: path.resolve(sharedNodeModules, "scheduler/index.js"),
      },
    ],
  },
  server: {
    host: "127.0.0.1",
    port: 4322,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4323",
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 4322,
  },
});
