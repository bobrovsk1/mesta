import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "automatic"
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    host: "127.0.0.1",
    port: 4322,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4323",
        changeOrigin: true
      }
    }
  },
  preview: {
    host: "127.0.0.1",
    port: 4322
  }
});
