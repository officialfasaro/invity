import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import apiRouter from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import prisma from "./config/prisma";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow images/audio to be loaded across origins
    contentSecurityPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : ["http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3000", "http://127.0.0.1:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Static uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// Mount API
app.use("/api", apiRouter);

// Root Welcome / Health
app.get("/", (_req: Request, res: Response) => {
  res.json({
    service: "Fasaro Wedding Platform API (Express.js)",
    version: "1.0.0",
    healthCheck: "/api/health",
  });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint API tidak ditemukan.",
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 [Fasaro Backend] Express server berjalan di http://localhost:${PORT}`);
  console.log(`📡 [Fasaro Backend] Mode: ${process.env.NODE_ENV || "development"}`);
});

// Graceful Shutdown
async function gracefulShutdown(signal: string) {
  console.log(`\n[Fasaro Backend] Menerima sinyal ${signal}, menutup koneksi server...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("[Fasaro Backend] Koneksi database ditutup. Server berhenti.");
    process.exit(0);
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

export default app;
