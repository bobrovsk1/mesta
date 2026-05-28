<<<<<<< HEAD
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
=======
import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "automatic"
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
  },
  server: {
    host: "127.0.0.1",
    port: 4322,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4323",
<<<<<<< HEAD
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 4322,
  },
=======
        changeOrigin: true
      }
    }
  },
  preview: {
    host: "127.0.0.1",
    port: 4322
  }
>>>>>>> 788d3a52fe4e5b7afbb71a0a6dd6bd2ba23db7df
});
