import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import dynamicImport from "vite-plugin-dynamic-import";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-macros"],
      },
    }),
    dynamicImport(),
  ],
  assetsInclude: ["**/*.md"],
  resolve: {
    alias: {
      "@": path.join(__dirname, "src"),
    },
  },
  build: {
    outDir: "build",
  },
  preview: {
    allowedHosts: ["pricefaster.onrender.com"], // Allow your Render domain
    host: "0.0.0.0", // Bind to all network interfaces
  },
});
