import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      "process.env": JSON.stringify(env),
    },
    plugins: [
      tailwindcss(),
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
        "next/link": path.resolve(import.meta.dirname, "./src/compat/link.tsx"),
        "next/image": path.resolve(import.meta.dirname, "./src/compat/image.tsx"),
        "next/navigation": path.resolve(import.meta.dirname, "./src/compat/navigation.ts"),
      },
    },
    server: {
      port: Number(env.PORT || env.VITE_PORT || 3001),
      proxy: {
        "/api": {
          target: env.BACKEND_URL || "http://localhost:5001",
          changeOrigin: true,
        },
        "/uploads": {
          target: env.BACKEND_URL || "http://localhost:5001",
          changeOrigin: true,
        },
      },
    },
  };
});
