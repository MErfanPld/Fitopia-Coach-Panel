import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Fitopia Coach",
        short_name: "Coach",
        description: "پنل اختصاصی مربیان فیتوپیا",
        theme_color: "#FF6A00",
        background_color: "#07070A",
        display: "standalone",
        orientation: "any",
        dir: "rtl",
        lang: "fa",
        start_url: "/welcome",
        scope: "/",
        icons: [
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ],
  server: {
    port: 5174,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "https://fitopiaapi.pythonanywhere.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
