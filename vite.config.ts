import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
 server: {
    host: true,
    allowedHosts: true, // hoặc ['...']
    proxy: {
      // Khi thấy đường dẫn bắt đầu bằng /api/v1
      '/api/v1': {
        target: 'http://localhost:8080', // Chuyển hướng về BE của bạn
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
