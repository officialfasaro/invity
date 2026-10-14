import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Validasi data gagal",
      details: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
    return;
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Terjadi kesalahan internal server.";

  if (process.env.NODE_ENV !== "production") {
    console.error("[Backend Error]:", err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}
