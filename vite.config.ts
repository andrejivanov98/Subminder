import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa"; // Import the plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Add the PWA plugin configuration
    VitePWA({
      registerType: "autoUpdate",

      // This tells the plugin to create the manifest file
      manifest: {
        name: "SubMinder",
        short_name: "SubMinder",
        description: "Your personal subscription tracker.",
        theme_color: "#4f46e5", // This is our indigo color
        background_color: "#f3f4f6", // This is our gray-100 color
        start_url: "/",
        display: "standalone",
        icons: [
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
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable", // For Android rounded icons
          },
        ],
      },

      // This tells the plugin to create the service worker
      workbox: {
        // This will cache all our core app files
        // (HTML, CSS, JS, fonts)
        globPatterns: ["**/*.{js,css,html,ico,png,svg,ttf}"],
      },
    }),
  ],
});
