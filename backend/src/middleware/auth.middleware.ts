import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import prisma from "../config/prisma";
import { AUTH_COOKIE_NAME, JWT_SECRET } from "../config/constants";

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface ReceptionTokenPayload {
  role: "RECEPTIONIST";
  invitationId: string;
  slug: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      reception?: ReceptionTokenPayload;
    }
  }
}

export function signJwtToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJwtToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function signReceptionToken(payload: ReceptionTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "48h" });
}

export function verifyReceptionToken(token: string): ReceptionTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    if (
      decoded &&
      decoded.role === "RECEPTIONIST" &&
      typeof decoded.invitationId === "string" &&
      typeof decoded.slug === "string"
    ) {
      return {
        role: "RECEPTIONIST",
        invitationId: decoded.invitationId,
        slug: decoded.slug,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function extractToken(req: Request): string | null {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

export function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);
  if (token) {
    const payload = verifyJwtToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Sesi login Anda telah berakhir. Silakan masuk kembali." });
    return;
  }

  const payload = verifyJwtToken(token);
  if (!payload) {
    res.status(401).json({ error: "UNAUTHORIZED", message: "Token otentikasi tidak valid atau telah kedaluwarsa." });
    return;
  }

  req.user = payload;
  next();
}

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  authMiddleware(req, res, async () => {
    if (!req.user) {
      res.status(401).json({ error: "UNAUTHORIZED", message: "Sesi login Anda telah berakhir." });
      return;
    }

    let isAdmin = req.user.role === UserRole.ADMIN || req.user.email === "admin@admin.com";

    // If not admin in JWT, check DB in case role was updated
    if (!isAdmin && req.user.userId) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: req.user.userId },
          select: { role: true, email: true },
        });
        if (dbUser && (dbUser.role === UserRole.ADMIN || dbUser.email === "admin@admin.com")) {
          isAdmin = true;
          req.user.role = UserRole.ADMIN;
        }
      } catch {
        // Fallback
      }
    }

    if (!isAdmin) {
      res.status(403).json({ error: "FORBIDDEN_ADMIN_ONLY", message: "Akses ditolak. Fitur ini khusus untuk Administrator." });
      return;
    }

    next();
  });
}

export async function receptionAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const rawSlug = req.params.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  if (!slug || typeof slug !== "string") {
    res.status(400).json({ success: false, error: "Slug undangan tidak valid." });
    return;
  }

  // 1. Periksa token JWT resepsionis dari Header
  const authHeader = req.headers.authorization;
  const token =
    (authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null) ||
    (req.headers["x-reception-token"] as string | undefined) ||
    (req.query.token as string | undefined);

  if (token) {
    const payload = verifyReceptionToken(token);
    if (payload && payload.slug === slug) {
      req.reception = payload;
      next();
      return;
    }
  }

  // 2. Periksa fallback PIN dari Header / Query / Body
  const pin =
    (req.headers["x-reception-pin"] as string | undefined) ||
    (req.query.pin as string | undefined) ||
    req.body?.pin;

  if (pin && typeof pin === "string") {
    const invitation = await prisma.invitation.findUnique({
      where: { slug },
      select: { id: true, slug: true, coupleInfo: true },
    });

    if (invitation) {
      const coupleInfo = (invitation.coupleInfo as Record<string, unknown>) || {};
      const expectedPin = String(coupleInfo.receptionPin || "123456").trim();
      if (pin.trim() === expectedPin) {
        req.reception = {
          role: "RECEPTIONIST",
          invitationId: invitation.id,
          slug: invitation.slug,
        };
        next();
        return;
      }
    }
  }

  res.status(401).json({
    success: false,
    error: "Akses ditolak. Token atau PIN Meja Tamu tidak valid atau sesi telah berakhir.",
  });
}
