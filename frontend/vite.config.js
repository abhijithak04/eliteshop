import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 3000,

    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: "dist",

    sourcemap: false,

    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks: {
          reactVendor: [
            "react",
            "react-dom",
            "react-router-dom",
          ],

          bootstrapVendor: [
            "react-bootstrap",
            "bootstrap",
          ],

          animationVendor: [
            "framer-motion",
          ],

          toastVendor: [
            "react-toastify",
          ],
        },
      },
    },
  },
})