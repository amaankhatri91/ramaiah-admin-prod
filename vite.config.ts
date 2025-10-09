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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],
          'ui-vendor': ['framer-motion', 'react-icons', 'react-select', 'react-modal'],
          'chart-vendor': ['apexcharts', 'react-apexcharts', '@visx/pattern'],
          'form-vendor': ['formik', 'yup', 'react-number-format'],
          'table-vendor': ['@tanstack/react-table', '@tanstack/match-sorter-utils'],
          'calendar-vendor': ['@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/timegrid', '@fullcalendar/interaction'],
          'utils-vendor': ['lodash', 'dayjs', 'axios', 'classnames'],
          'editor-vendor': ['react-quill', 'react-syntax-highlighter', 'html-react-parser'],
          'misc-vendor': ['swiper', 'react-beautiful-dnd', 'react-scroll', 'react-tooltip']
        }
      }
    }
  },
  // preview: {
  //   allowedHosts: ["pricefaster.onrender.com"], // Allow your Render domain
  //   host: "0.0.0.0", // Bind to all network interfaces
  // },
});
