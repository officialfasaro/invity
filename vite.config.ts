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
        "@": path.resolve(process.cwd(), "./src"),
        "next/link": path.resolve(process.cwd(), "./src/compat/link.tsx"),
        "next/image": path.resolve(process.cwd(), "./src/compat/image.tsx"),
        "next/navigation": path.resolve(process.cwd(), "./src/compat/navigation.ts"),
      },
    },
    server: {
      port: Number(env.VITE_PORT || 3001),
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
    build: {
      outDir: "dist",
      emptyOutDir: true,
    },
  };
});
