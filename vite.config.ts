import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/v1/mockforge": {
        target: "http://localhost:17930",
        changeOrigin: true,
        ws: true,
      },
    },
  },
});