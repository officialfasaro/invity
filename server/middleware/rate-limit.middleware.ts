import { Request, Response, NextFunction } from "express";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

interface RateLimitEntry {
  count: number;
  expiresAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Periodic cleanup
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.expiresAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  if (typeof timer.unref === "function") {
    timer.unref();
  }
}

export async function checkRateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const key = `ratelimit:${action}:${identifier}`;
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.expiresAt <= now) {
    rateLimitStore.set(key, { count: 1, expiresAt: now + windowSec * 1000 });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
    };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      allowed: false,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
  };
}

export function rateLimitMiddleware(action: string, limit: number, windowSec: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const result = await checkRateLimit(ip, action, limit, windowSec);
    if (!result.allowed) {
      res.status(429).json({
        error: "Terlalu banyak permintaan. Silakan coba lagi beberapa saat.",
        remaining: 0,
      });
      return;
    }
    next();
  };
}
