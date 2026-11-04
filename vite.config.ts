import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      // La actualización se avisa desde la app (PwaUpdatePrompt) para no
      // recargar en medio de una operación de playa o caja.
      registerType: "prompt",
      injectRegister: null,
      includeAssets: [
        "favicon.ico",
        "pwa-icon.svg",
        "apple-touch-icon-180x180.png",
      ],
      manifest: {
        id: "/",
        name: "ParkControl",
        short_name: "ParkControl",
        description:
          "Gestión de playa, acarreos y caja de ParkControl. Funciona sin conexión para las operaciones del día.",
        lang: "es-AR",
        dir: "ltr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        theme_color: "#39659e",
        background_color: "#ffffff",
        categories: ["business", "productivity"],
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // El shell (HTML, JS, CSS, fuentes e íconos) queda precacheado: la app
        // abre sin red después de la primera visita.
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        runtimeCaching: [
          {
            // La API nunca se cachea en el service worker: el offline de datos
            // vive en IndexedDB (Fase 1) y así no se sirven respuestas viejas
            // como si fueran actuales.
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkOnly",
            method: "GET",
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
