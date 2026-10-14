import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import apiRouter from "./routes";
import { errorHandler } from "./middleware/error.middleware";

dotenv.config();

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: false, // allow images/audio to be loaded across origins
    contentSecurityPolicy: false,
  })
);

// CORS configuration
const configuredOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : [
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // In same-domain deployment (Vercel) origin might be same-origin or undefined
      if (!origin || configuredOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        // In production on Vercel, requests to /api are same-origin
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Static uploads directory (used for local fallback storage)
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// Root API Welcome / Health info
app.get("/api", (_req: Request, res: Response) => {
  res.json({
    service: "Fasaro Wedding Platform API (Express.js)",
    version: "1.0.0",
    healthCheck: "/api/health",
  });
});

// Mount API router under /api AND under root to handle Vercel rewrites seamlessly
app.use("/api", apiRouter);
app.use("/", apiRouter);

// 404 Handler for unmatched API routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint API tidak ditemukan.",
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
export { app };
