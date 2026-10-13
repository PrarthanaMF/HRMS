import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: "4500",
    // Backend API in development: same origin for the browser, so the login cookie just works
    proxy: {
      "/api": process.env.VITE_API_PROXY || "http://localhost:8000",
    },
    watch: {
      usePolling: true,
      interval: 200,
    },
  },
});
