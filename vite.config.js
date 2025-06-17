import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig((env) => ({
  base: "/",
  plugins: [
    react(),
    VitePWA({
      devOptions: {
        enabled: process.env.NODE_ENV === "development",
        type: "module",
      },
      registerType: "autoUpdate",
      injectRegister: null,
      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.js",
      manifest: {
        short_name: "RADFish",
        name: "RADFish React Boilerplate",
        icons: [
          {
            src: "icons/144.png",
            type: "image/png",
            sizes: "144x144",
            purpose: "any",
          },
          {
            src: "icons/144.png",
            type: "image/png",
            sizes: "144x144",
            purpose: "maskable",
          },
          {
            src: "icons/192.png",
            type: "image/png",
            sizes: "192x192",
            purpose: "maskable",
          },
          {
            src: "icons/512.png",
            type: "image/png",
            sizes: "512x512",
            purpose: "maskable",
          },
        ],
        start_url: ".",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#ffffff",
      },
    }),
  ],
  server: {
    open: true,
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    globals: true,
    setupFiles: "./src/__tests__/setup.js",
    environment: "jsdom",
  },
}));
