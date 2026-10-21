// server/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv2 from "dotenv";
import path4 from "path";

// server/routes/index.ts
import { Router as Router9 } from "express";

// server/routes/auth.routes.ts
import { Router } from "express";

// server/controllers/auth.controller.ts
import bcrypt from "bcryptjs";
import crypto2 from "crypto";

// server/config/prisma.ts
import { PrismaClient } from "@prisma/client";
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
});
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
var prisma_default = prisma;

// server/utils/validations.ts
import { z } from "zod";
var eventScheduleSchema = z.object({
  eventName: z.string().min(1, "Nama acara wajib diisi").max(100),
  date: z.string().min(1, "Tanggal acara wajib diisi"),
  startTime: z.string().min(1, "Waktu mulai wajib diisi").max(50),
  endTime: z.string().max(50).optional().nullable(),
  venueName: z.string().min(1, "Nama tempat wajib diisi").max(200),
  address: z.string().min(1, "Alamat wajib diisi").max(500),
  mapsUrl: z.string().refine(
    (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val) || val.includes("maps"),
    "Format link Google Maps tidak valid"
  ).optional().nullable().or(z.literal("")),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable()
});
var galleryItemSchema = z.object({
  imageUrl: z.string().min(1, "URL atau file gambar wajib diisi").refine(
    (val) => val.startsWith("/") || /^https?:\/\//.test(val) || val.startsWith("blob:"),
    "Format URL atau path gambar tidak valid"
  ),
  caption: z.string().max(300).optional().nullable(),
  sortOrder: z.number().int().default(0)
});
var bankAccountSchema = z.object({
  bankName: z.string().min(1, "Nama bank/e-wallet wajib diisi").max(50),
  accountNumber: z.string().min(1, "Nomor rekening wajib diisi").max(50),
  accountHolder: z.string().min(1, "Nama pemilik rekening wajib diisi").max(100),
  qrisImageUrl: z.string().refine(
    (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val),
    "Format URL atau file QRIS tidak valid"
  ).optional().nullable().or(z.literal(""))
});
var coupleInfoSchema = z.object({
  groomName: z.string().min(1, "Nama pengantin pria wajib diisi").max(100),
  groomNickname: z.string().min(1, "Nama panggilan mempelai pria wajib diisi").max(50),
  groomFather: z.string().max(100).optional().nullable(),
  groomMother: z.string().max(100).optional().nullable(),
  groomInstagram: z.string().max(50).optional().nullable(),
  groomPhoto: z.string().refine(
    (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val),
    "Format URL atau file foto tidak valid"
  ).optional().nullable().or(z.literal("")),
  brideName: z.string().min(1, "Nama pengantin wanita wajib diisi").max(100),
  brideNickname: z.string().min(1, "Nama panggilan mempelai wanita wajib diisi").max(50),
  brideFather: z.string().max(100).optional().nullable(),
  brideMother: z.string().max(100).optional().nullable(),
  brideInstagram: z.string().max(50).optional().nullable(),
  bridePhoto: z.string().refine(
    (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val),
    "Format URL atau file foto tidak valid"
  ).optional().nullable().or(z.literal("")),
  greetingMessage: z.string().max(3e3).optional().nullable(),
  musicUrl: z.string().optional().nullable(),
  youtubeVideoUrl: z.string().optional().nullable(),
  desktopCoverImage: z.string().refine(
    (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val),
    "Format URL atau file foto cover desktop tidak valid"
  ).optional().nullable().or(z.literal("")),
  useVideoAsDesktopCover: z.boolean().optional().nullable(),
  backgroundImage: z.string().refine(
    (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val) || val.startsWith("data:"),
    "Format URL atau file background tidak valid"
  ).optional().nullable().or(z.literal("")),
  floralOrnament: z.string().max(50).optional().nullable(),
  giftAddress: z.string().max(500).optional().nullable(),
  giftReceiver: z.string().max(100).optional().nullable(),
  giftPhone: z.string().max(50).optional().nullable(),
  giftAddresses: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().max(100).optional().nullable(),
      receiver: z.string().max(100).optional().nullable(),
      phone: z.string().max(50).optional().nullable(),
      address: z.string().max(500)
    })
  ).optional().nullable(),
  stories: z.array(
    z.object({
      date: z.string(),
      title: z.string(),
      story: z.string(),
      imageUrl: z.string().refine(
        (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val),
        "Format URL atau file foto kisah cinta tidak valid"
      ).optional().nullable().or(z.literal(""))
    })
  ).optional().nullable(),
  receptionPin: z.string().min(4, "PIN Meja Tamu minimal 4 karakter").max(12, "PIN Meja Tamu maksimal 12 karakter").optional().nullable()
});
var invitationSchema = z.object({
  title: z.string().min(1, "Judul undangan minimal 1 karakter").max(150),
  slug: z.string().min(2, "Slug minimal 2 karakter").max(100).regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda strip"),
  themeId: z.string().min(1, "Tema wajib dipilih").max(50),
  coupleInfo: coupleInfoSchema,
  musicUrl: z.string().optional().nullable(),
  youtubeVideoUrl: z.string().optional().nullable(),
  activeUntil: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
  schedules: z.array(eventScheduleSchema).default([]),
  galleries: z.array(galleryItemSchema).default([]),
  bankAccounts: z.array(bankAccountSchema).default([])
});
var updateInvitationSchema = invitationSchema.partial().extend({
  title: z.string().min(3).max(150).optional(),
  slug: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/).optional(),
  themeId: z.string().min(1).max(50).optional(),
  coupleInfo: coupleInfoSchema.partial().optional(),
  selectedTier: z.enum(["STARTER", "ELEGANT", "ULTIMATE"]).optional().nullable()
});
var rsvpSchema = z.object({
  invitationId: z.string().min(1, "ID undangan wajib diisi"),
  guestName: z.string().min(1, "Nama tamu wajib diisi").max(100),
  status: z.enum(["ATTENDING", "NOT_ATTENDING", "UNCERTAIN"], {
    message: "Status kehadiran tidak valid"
  }),
  attendeeCount: z.number().int().min(1, "Jumlah tamu minimal 1").max(10, "Jumlah tamu maksimal 10").default(1),
  sessionChosen: z.string().max(50).optional().nullable()
});
var wishSchema = z.object({
  invitationId: z.string().min(1, "ID undangan wajib diisi"),
  senderName: z.string().min(1, "Nama pengirim wajib diisi").max(100),
  message: z.string().min(1, "Pesan doa wajib diisi").max(500, "Pesan maksimal 500 karakter"),
  reaction: z.string().max(20).optional().nullable()
});
var registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().min(1, "Email wajib diisi").email("Format email tidak valid").toLowerCase(),
  password: z.string().min(6, "Password minimal 6 karakter").max(100),
  plan: z.enum(["STARTER", "ELEGANT", "ULTIMATE"]).optional().nullable()
});
var loginSchema = z.object({
  email: z.string().trim().min(1, "Email wajib diisi").email("Format email tidak valid").toLowerCase(),
  password: z.string().min(1, "Password wajib diisi")
});
var createOrderSchema = z.object({
  invitationId: z.string().min(1, "ID undangan wajib diisi").optional().nullable(),
  tier: z.enum(["STARTER", "ELEGANT", "ULTIMATE"]),
  amount: z.number().positive("Nominal harus lebih dari 0"),
  paymentType: z.enum(["GATEWAY", "MANUAL_QRIS", "MANUAL_BANK", "MANUAL"]).default("MANUAL_BANK"),
  proofImageUrl: z.string().refine(
    (val) => !val || val.startsWith("/") || /^https?:\/\//.test(val),
    "Format URL atau path bukti transfer tidak valid"
  ).optional().nullable()
});

// server/config/constants.ts
var AUTH_COOKIE_NAME = "fasaro_token";
var GOOGLE_OAUTH_STATE_COOKIE = "fasaro_google_oauth_state";
var JWT_SECRET = process.env.NEXTAUTH_SECRET || "fasaro-jwt-super-secret-key-32chars";
var KNOWN_DEMO_SLUGS = [
  "rian-sinta",
  "faisal-putri",
  "adirara",
  "royal",
  "syari",
  "rustic",
  "minimalist",
  "minang",
  "botanical",
  "versa-mekar",
  "velvet",
  "burgundy",
  "showcase",
  "raka-dan-ayu",
  "raka-ayu",
  "demo-raka-ayu",
  "demo-tema-4",
  "tema-4",
  "wedding-3d",
  "wedding-3d-template",
  "demo-wedding-3d",
  "demo-tema-5",
  "tema-5",
  "botanical-tema-01",
  "demo-botanical-tema-01",
  "editorial-tema-01",
  "demo-editorial-tema-01",
  "gothic-tema-01",
  "demo-gothic-tema-01",
  "royal-tema-01",
  "demo-royal-tema-01",
  "3d-tema-01",
  "demo-3d-tema-01"
];
var ALLOWED_IMAGE_MIME_TYPES = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif"
]);
var ALLOWED_IMAGE_EXTENSIONS = /* @__PURE__ */ new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
var MAX_IMAGE_SIZE = 10 * 1024 * 1024;
var ALLOWED_FOLDERS = /* @__PURE__ */ new Set(["couples", "qris", "galleries", "proofs", "stories"]);
var ALLOWED_MUSIC_MIME_TYPES = /* @__PURE__ */ new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/aac",
  "audio/m4a"
]);
var ALLOWED_MUSIC_EXTENSIONS = /* @__PURE__ */ new Set([".mp3", ".wav", ".ogg", ".aac", ".m4a"]);
var MAX_MUSIC_SIZE = 15 * 1024 * 1024;

// server/middleware/auth.middleware.ts
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
function signJwtToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
function verifyJwtToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
function signReceptionToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "48h" });
}
function verifyReceptionToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && decoded.role === "RECEPTIONIST" && typeof decoded.invitationId === "string" && typeof decoded.slug === "string") {
      return {
        role: "RECEPTIONIST",
        invitationId: decoded.invitationId,
        slug: decoded.slug
      };
    }
    return null;
  } catch {
    return null;
  }
}
function extractToken(req) {
  const cookieToken = req.cookies?.[AUTH_COOKIE_NAME];
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}
function authMiddleware(req, res, next) {
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
function adminMiddleware(req, res, next) {
  authMiddleware(req, res, async () => {
    if (!req.user) {
      res.status(401).json({ error: "UNAUTHORIZED", message: "Sesi login Anda telah berakhir." });
      return;
    }
    let isAdmin = req.user.role === UserRole.ADMIN || req.user.email === "admin@admin.com";
    if (!isAdmin && req.user.userId) {
      try {
        const dbUser = await prisma_default.user.findUnique({
          where: { id: req.user.userId },
          select: { role: true, email: true }
        });
        if (dbUser && (dbUser.role === UserRole.ADMIN || dbUser.email === "admin@admin.com")) {
          isAdmin = true;
          req.user.role = UserRole.ADMIN;
        }
      } catch {
      }
    }
    if (!isAdmin) {
      res.status(403).json({ error: "FORBIDDEN_ADMIN_ONLY", message: "Akses ditolak. Fitur ini khusus untuk Administrator." });
      return;
    }
    next();
  });
}
async function receptionAuthMiddleware(req, res, next) {
  const rawSlug = req.params.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  if (!slug || typeof slug !== "string") {
    res.status(400).json({ success: false, error: "Slug undangan tidak valid." });
    return;
  }
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null) || req.headers["x-reception-token"] || req.query.token;
  if (token) {
    const payload = verifyReceptionToken(token);
    if (payload && payload.slug === slug) {
      req.reception = payload;
      next();
      return;
    }
  }
  const pin = req.headers["x-reception-pin"] || req.query.pin || req.body?.pin;
  if (pin && typeof pin === "string") {
    const invitation = await prisma_default.invitation.findUnique({
      where: { slug },
      select: { id: true, slug: true, coupleInfo: true }
    });
    if (invitation) {
      const coupleInfo = invitation.coupleInfo || {};
      const expectedPin = String(coupleInfo.receptionPin || "123456").trim();
      if (pin.trim() === expectedPin) {
        req.reception = {
          role: "RECEPTIONIST",
          invitationId: invitation.id,
          slug: invitation.slug
        };
        next();
        return;
      }
    }
  }
  res.status(401).json({
    success: false,
    error: "Akses ditolak. Token atau PIN Meja Tamu tidak valid atau sesi telah berakhir."
  });
}

// server/services/google-auth.service.ts
import crypto from "crypto";
function isGoogleAuthConfigured() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return Boolean(clientId && clientSecret && clientId.trim() !== "" && clientSecret.trim() !== "");
}
function getBaseUrl(requestUrl) {
  if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim() !== "") {
    return process.env.NEXTAUTH_URL.trim().replace(/\/$/, "");
  }
  if (requestUrl) {
    try {
      const parsed = new URL(requestUrl);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
    }
  }
  return "http://localhost:3001";
}
function getGoogleRedirectUri(requestUrl) {
  if (process.env.GOOGLE_CALLBACK_URL && process.env.GOOGLE_CALLBACK_URL.trim() !== "") {
    return process.env.GOOGLE_CALLBACK_URL.trim();
  }
  const baseUrl = getBaseUrl(requestUrl);
  return `${baseUrl}/api/auth/google/callback`;
}
function generateOAuthState() {
  return crypto.randomBytes(32).toString("hex");
}
function getGoogleOAuthUrl(state, requestUrl) {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const redirectUri = getGoogleRedirectUri(requestUrl);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
async function exchangeCodeForTokens(code, requestUrl) {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const redirectUri = getGoogleRedirectUri(requestUrl);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal menukar authorization code Google: ${errorText}`);
  }
  return response.json();
}
async function getGoogleUserProfile(accessToken) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal mengambil data profil Google: ${errorText}`);
  }
  return response.json();
}

// server/controllers/auth.controller.ts
async function userHasActivePackage(userId) {
  const settledTx = await prisma_default.paymentTransaction.findFirst({
    where: { userId, paymentStatus: "SETTLEMENT" }
  });
  if (settledTx) return true;
  const invitation = await prisma_default.invitation.findFirst({
    where: { userId },
    include: {
      paymentTransactions: {
        where: { paymentStatus: "SETTLEMENT" }
      }
    }
  });
  if (!invitation) return false;
  if (invitation.paymentTransactions && invitation.paymentTransactions.length > 0) {
    return true;
  }
  if (invitation.activeUntil && new Date(invitation.activeUntil) > /* @__PURE__ */ new Date()) {
    return true;
  }
  return false;
}
async function getUserLatestTransaction(userId) {
  const tx = await prisma_default.paymentTransaction.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      orderId: true,
      paymentStatus: true,
      tier: true,
      amount: true,
      paymentType: true,
      proofImageUrl: true,
      createdAt: true,
      verifiedAt: true
    }
  });
  if (!tx) return null;
  return {
    ...tx,
    amount: Number(tx.amount)
  };
}
async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi gagal",
        details: parsed.error.format()
      });
      return;
    }
    const { email, password } = parsed.data;
    const user = await prisma_default.user.findUnique({
      where: { email }
    });
    if (!user) {
      res.status(401).json({ error: "Email atau kata sandi tidak valid" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Email atau kata sandi tidak valid" });
      return;
    }
    const hasActivePackage = user.role === "ADMIN" ? true : await userHasActivePackage(user.id);
    const latestTransaction = await getUserLatestTransaction(user.id);
    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      path: "/"
    });
    res.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasActivePackage,
        latestTransaction
      }
    });
  } catch (error) {
    next(error);
  }
}
async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi gagal",
        details: parsed.error.format()
      });
      return;
    }
    const regSetting = await prisma_default.systemSetting.findUnique({
      where: { key: "feature_registration" }
    });
    if (regSetting && regSetting.value === "false") {
      res.status(403).json({
        error: "Pendaftaran pengguna baru sementara ditutup untuk pemeliharaan sistem."
      });
      return;
    }
    const { name, email, password, plan } = parsed.data;
    const existingUser = await prisma_default.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      res.status(409).json({ error: "Email sudah terdaftar" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma_default.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER",
        invitations: {
          create: {
            slug: `undangan-${Math.random().toString(36).substring(2, 8)}`,
            title: `Pernikahan ${name}`,
            themeId: "botanical",
            isActive: true,
            coupleInfo: {
              groomName: name,
              groomNickname: name.split(" ")[0] || "Pria",
              groomFather: "",
              groomMother: "",
              groomInstagram: "",
              groomPhoto: "",
              brideName: "Mempelai Wanita",
              brideNickname: "Wanita",
              brideFather: "",
              brideMother: "",
              brideInstagram: "",
              bridePhoto: "",
              greetingMessage: "Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Anda untuk menghadiri pernikahan kami.",
              stories: [],
              selectedTier: plan || null
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      path: "/"
    });
    res.status(201).json({
      message: "Registrasi berhasil",
      user
    });
  } catch (error) {
    next(error);
  }
}
async function logout(_req, res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  res.json({ message: "Logout berhasil" });
}
function googleAuthStatus(_req, res) {
  res.json({ enabled: isGoogleAuthConfigured() });
}
function googleAuth(req, res) {
  if (!isGoogleAuthConfigured()) {
    res.redirect(`${getBaseUrl(req.headers.referer)}/login?error=google_not_configured`);
    return;
  }
  const rawFrom = req.query.from;
  const returnTarget = typeof rawFrom === "string" && rawFrom.startsWith("/") ? rawFrom : "/dashboard";
  const state = generateOAuthState();
  const statePayload = JSON.stringify({ state, returnTarget });
  res.cookie(GOOGLE_OAUTH_STATE_COOKIE, statePayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1e3,
    path: "/"
  });
  const googleUrl = getGoogleOAuthUrl(state, req.headers.referer);
  res.redirect(googleUrl);
}
async function googleCallback(req, res) {
  const code = req.query.code;
  const state = req.query.state;
  const errorParam = req.query.error;
  const frontendBase = getBaseUrl(req.headers.referer);
  const loginRedirect = (errorCode) => {
    res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, { path: "/" });
    res.redirect(`${frontendBase}/login?error=${encodeURIComponent(errorCode)}`);
  };
  if (errorParam) {
    loginRedirect("google_access_denied");
    return;
  }
  if (!code || !state) {
    loginRedirect("invalid_oauth_response");
    return;
  }
  const savedStateCookie = req.cookies?.[GOOGLE_OAUTH_STATE_COOKIE];
  if (!savedStateCookie) {
    loginRedirect("session_expired");
    return;
  }
  let savedState;
  let returnTarget = "/dashboard";
  try {
    const parsed = JSON.parse(savedStateCookie);
    savedState = parsed.state;
    if (parsed.returnTarget && typeof parsed.returnTarget === "string") {
      returnTarget = parsed.returnTarget;
    }
  } catch {
    loginRedirect("invalid_session_state");
    return;
  }
  if (!savedState || savedState !== state) {
    loginRedirect("csrf_state_mismatch");
    return;
  }
  try {
    const tokenData = await exchangeCodeForTokens(code, req.headers.referer);
    const profile = await getGoogleUserProfile(tokenData.access_token);
    if (!profile.email) {
      loginRedirect("google_email_missing");
      return;
    }
    const email = profile.email.toLowerCase().trim();
    let user = await prisma_default.user.findUnique({
      where: { email }
    });
    if (!user) {
      const fallbackPassword = crypto2.randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(fallbackPassword, 10);
      user = await prisma_default.user.create({
        data: {
          email,
          name: profile.name || email.split("@")[0],
          passwordHash,
          role: "USER"
        }
      });
    }
    const hasActive = user.role === "ADMIN" ? true : await userHasActivePackage(user.id);
    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3,
      path: "/"
    });
    res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, { path: "/" });
    let destination = "/dashboard";
    if (user.role === "ADMIN") {
      destination = "/admin";
    } else if (!hasActive) {
      destination = "/order";
    } else if (returnTarget && returnTarget.startsWith("/")) {
      destination = returnTarget;
    }
    res.redirect(`${frontendBase}${destination}`);
  } catch (err) {
    loginRedirect("google_auth_failed");
  }
}
async function getMe(req, res, next) {
  try {
    if (!req.user) {
      res.status(401).json({ user: null });
      return;
    }
    const user = await prisma_default.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    if (!user) {
      res.status(401).json({ user: null });
      return;
    }
    const hasActivePackage = user.role === "ADMIN" ? true : await userHasActivePackage(user.id);
    const latestTransaction = await getUserLatestTransaction(user.id);
    res.json({
      user: {
        ...user,
        hasActivePackage,
        latestTransaction
      }
    });
  } catch (error) {
    next(error);
  }
}

// server/middleware/rate-limit.middleware.ts
var rateLimitStore = /* @__PURE__ */ new Map();
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.expiresAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1e3);
  if (typeof timer.unref === "function") {
    timer.unref();
  }
}
async function checkRateLimit(identifier, action, limit, windowSec) {
  const key = `ratelimit:${action}:${identifier}`;
  const now = Date.now();
  const existing = rateLimitStore.get(key);
  if (!existing || existing.expiresAt <= now) {
    rateLimitStore.set(key, { count: 1, expiresAt: now + windowSec * 1e3 });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1)
    };
  }
  existing.count += 1;
  if (existing.count > limit) {
    return {
      allowed: false,
      remaining: 0
    };
  }
  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count)
  };
}
function rateLimitMiddleware(action, limit, windowSec) {
  return async (req, res, next) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "127.0.0.1";
    const result = await checkRateLimit(ip, action, limit, windowSec);
    if (!result.allowed) {
      res.status(429).json({
        error: "Terlalu banyak permintaan. Silakan coba lagi beberapa saat.",
        remaining: 0
      });
      return;
    }
    next();
  };
}

// server/routes/auth.routes.ts
var router = Router();
router.post("/login", rateLimitMiddleware("login", 10, 60), login);
router.post("/register", rateLimitMiddleware("register", 5, 60), register);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
router.get("/google/status", googleAuthStatus);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
var auth_routes_default = router;

// server/routes/invitation.routes.ts
import { Router as Router2 } from "express";

// server/services/cache.service.ts
var metaCache = /* @__PURE__ */ new Map();
var fullInvitationCache = /* @__PURE__ */ new Map();
var CACHE_TTL_MS = 10 * 60 * 1e3;
async function getInvitationMeta(identifier) {
  const now = Date.now();
  const cached = metaCache.get(identifier);
  if (cached && cached.expiresAt > now) {
    return { id: cached.id, isActive: cached.isActive };
  }
  const cleanSlug = identifier.replace(/^demo-/, "");
  const isCuid = identifier.startsWith("c") && identifier.length > 20;
  let invitation = null;
  try {
    if (isCuid) {
      invitation = await prisma_default.invitation.findUnique({
        where: { id: identifier },
        select: { id: true, isActive: true }
      });
    } else {
      invitation = await prisma_default.invitation.findUnique({
        where: { slug: cleanSlug },
        select: { id: true, isActive: true }
      });
      if (!invitation && cleanSlug !== identifier) {
        invitation = await prisma_default.invitation.findUnique({
          where: { slug: identifier },
          select: { id: true, isActive: true }
        });
      }
    }
  } catch {
    return null;
  }
  if (invitation) {
    const entry = {
      id: invitation.id,
      isActive: invitation.isActive,
      expiresAt: now + CACHE_TTL_MS
    };
    metaCache.set(identifier, entry);
    metaCache.set(invitation.id, entry);
    metaCache.set(cleanSlug, entry);
    return { id: invitation.id, isActive: invitation.isActive };
  }
  return null;
}
async function getCachedPublicInvitation(slug) {
  const now = Date.now();
  const cached = fullInvitationCache.get(slug);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }
  const invitation = await prisma_default.invitation.findFirst({
    where: {
      slug,
      isActive: true
    },
    select: {
      id: true,
      slug: true,
      title: true,
      themeId: true,
      coupleInfo: true,
      createdAt: true,
      eventSchedules: {
        select: {
          id: true,
          eventName: true,
          date: true,
          startTime: true,
          endTime: true,
          venueName: true,
          address: true,
          mapsUrl: true,
          latitude: true,
          longitude: true
        },
        orderBy: { date: "asc" }
      },
      galleries: {
        select: {
          id: true,
          imageUrl: true,
          caption: true,
          sortOrder: true
        },
        orderBy: { sortOrder: "asc" }
      },
      bankAccounts: {
        select: {
          id: true,
          bankName: true,
          accountNumber: true,
          accountHolder: true,
          qrisImageUrl: true
        }
      }
    }
  });
  if (invitation) {
    fullInvitationCache.set(slug, {
      data: invitation,
      expiresAt: now + 5 * 60 * 1e3
      // 5 mins
    });
  }
  return invitation;
}
function invalidateInvitationCache(slug, id) {
  metaCache.delete(slug);
  fullInvitationCache.delete(slug);
  if (id) {
    metaCache.delete(id);
  }
}

// server/controllers/invitation.controller.ts
async function listInvitations(req, res, next) {
  try {
    const user = req.user;
    const invitations = await prisma_default.invitation.findMany({
      where: { userId: user.userId },
      include: {
        eventSchedules: { orderBy: { date: "asc" } },
        galleries: { orderBy: { sortOrder: "asc" } },
        bankAccounts: true,
        _count: {
          select: {
            guests: true,
            rsvps: true,
            wishes: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ data: invitations });
  } catch (error) {
    next(error);
  }
}
async function createInvitation(req, res, next) {
  try {
    const user = req.user;
    const parsed = invitationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi gagal",
        details: parsed.error.format()
      });
      return;
    }
    const {
      title,
      slug,
      themeId,
      coupleInfo,
      activeUntil,
      isActive,
      schedules,
      galleries,
      bankAccounts
    } = parsed.data;
    const existingSlug = await prisma_default.invitation.findUnique({
      where: { slug }
    });
    if (existingSlug) {
      res.status(409).json({ error: "Slug sudah digunakan, silakan pilih slug lain" });
      return;
    }
    const invitation = await prisma_default.invitation.create({
      data: {
        userId: user.userId,
        title,
        slug,
        themeId,
        coupleInfo,
        activeUntil: activeUntil ? new Date(activeUntil) : null,
        isActive,
        eventSchedules: {
          create: schedules.map((schedule) => ({
            eventName: schedule.eventName,
            date: new Date(schedule.date),
            startTime: schedule.startTime,
            endTime: schedule.endTime ?? null,
            venueName: schedule.venueName,
            address: schedule.address,
            mapsUrl: schedule.mapsUrl || null,
            latitude: schedule.latitude ?? null,
            longitude: schedule.longitude ?? null
          }))
        },
        galleries: {
          create: galleries.map((gallery) => ({
            imageUrl: gallery.imageUrl,
            caption: gallery.caption ?? null,
            sortOrder: gallery.sortOrder
          }))
        },
        bankAccounts: {
          create: bankAccounts.map((account) => ({
            bankName: account.bankName,
            accountNumber: account.accountNumber,
            accountHolder: account.accountHolder,
            qrisImageUrl: account.qrisImageUrl || null
          }))
        }
      },
      include: {
        eventSchedules: true,
        galleries: true,
        bankAccounts: true
      }
    });
    res.status(201).json({
      message: "Undangan berhasil dibuat",
      data: invitation
    });
  } catch (error) {
    next(error);
  }
}
async function getInvitationById(req, res, next) {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = (Array.isArray(rawId) ? rawId[0] : rawId) || "";
    const invitation = await prisma_default.invitation.findFirst({
      where: {
        id,
        userId: user.userId
      },
      include: {
        eventSchedules: { orderBy: { date: "asc" } },
        galleries: { orderBy: { sortOrder: "asc" } },
        bankAccounts: true,
        guests: true,
        rsvps: { orderBy: { createdAt: "desc" } },
        wishes: { orderBy: { createdAt: "desc" } }
      }
    });
    if (!invitation) {
      res.status(404).json({ error: "Undangan tidak ditemukan" });
      return;
    }
    res.json({ data: invitation });
  } catch (error) {
    next(error);
  }
}
async function updateInvitationById(req, res, next) {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = (Array.isArray(rawId) ? rawId[0] : rawId) || "";
    const existing = await prisma_default.invitation.findFirst({
      where: {
        id,
        userId: user.userId
      }
    });
    if (!existing) {
      res.status(404).json({ error: "Undangan tidak ditemukan" });
      return;
    }
    const parsed = updateInvitationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi gagal",
        details: parsed.error.format()
      });
      return;
    }
    const {
      title,
      slug,
      themeId,
      coupleInfo,
      activeUntil,
      isActive,
      schedules,
      galleries,
      bankAccounts
    } = parsed.data;
    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma_default.invitation.findUnique({
        where: { slug }
      });
      if (slugTaken) {
        res.status(409).json({ error: "Slug sudah digunakan oleh undangan lain" });
        return;
      }
    }
    const mergedCoupleInfo = coupleInfo ? {
      ...existing.coupleInfo,
      ...coupleInfo
    } : existing.coupleInfo;
    const updated = await prisma_default.$transaction(async (tx) => {
      if (schedules) {
        await tx.eventSchedule.deleteMany({ where: { invitationId: id } });
        await tx.eventSchedule.createMany({
          data: schedules.map((schedule) => ({
            invitationId: id,
            eventName: schedule.eventName,
            date: new Date(schedule.date),
            startTime: schedule.startTime,
            endTime: schedule.endTime ?? null,
            venueName: schedule.venueName,
            address: schedule.address,
            mapsUrl: schedule.mapsUrl || null,
            latitude: schedule.latitude ?? null,
            longitude: schedule.longitude ?? null
          }))
        });
      }
      if (galleries) {
        await tx.gallery.deleteMany({ where: { invitationId: id } });
        await tx.gallery.createMany({
          data: galleries.map((gallery) => ({
            invitationId: id,
            imageUrl: gallery.imageUrl,
            caption: gallery.caption ?? null,
            sortOrder: gallery.sortOrder
          }))
        });
      }
      if (bankAccounts) {
        await tx.bankAccount.deleteMany({ where: { invitationId: id } });
        await tx.bankAccount.createMany({
          data: bankAccounts.map((account) => ({
            invitationId: id,
            bankName: account.bankName,
            accountNumber: account.accountNumber,
            accountHolder: account.accountHolder,
            qrisImageUrl: account.qrisImageUrl || null
          }))
        });
      }
      return tx.invitation.update({
        where: { id },
        data: {
          ...title !== void 0 && { title },
          ...slug !== void 0 && { slug },
          ...themeId !== void 0 && { themeId },
          ...coupleInfo !== void 0 && {
            coupleInfo: mergedCoupleInfo
          },
          ...activeUntil !== void 0 && {
            activeUntil: activeUntil ? new Date(activeUntil) : null
          },
          ...isActive !== void 0 && { isActive }
        },
        include: {
          eventSchedules: true,
          galleries: true,
          bankAccounts: true
        }
      });
    });
    invalidateInvitationCache(updated.slug, updated.id);
    if (existing.slug !== updated.slug) {
      invalidateInvitationCache(existing.slug, existing.id);
    }
    res.json({
      message: "Undangan berhasil diperbarui",
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// server/routes/invitation.routes.ts
var router2 = Router2();
router2.use(authMiddleware);
router2.get("/", listInvitations);
router2.post("/", createInvitation);
router2.get("/:id", getInvitationById);
router2.put("/:id", updateInvitationById);
var invitation_routes_default = router2;

// server/routes/public.routes.ts
import { Router as Router3 } from "express";

// server/controllers/public.controller.ts
import path from "path";
import fs from "fs";

// server/services/settings.service.ts
var SYSTEM_SETTING_DEFINITIONS = [
  // 0. Identitas Brand & Icon Aplikasi (Branding)
  {
    key: "site_logo_url",
    defaultValue: "",
    category: "cms",
    label: "Logo Brand Website",
    description: "Logo utama website yang tampil di navbar header, mobile topbar, footer, dan login",
    isPublic: true
  },
  {
    key: "site_favicon_url",
    defaultValue: "/favicon.ico",
    category: "cms",
    label: "Favicon Tab Browser",
    description: "Icon tab browser pengunjung (.ico / .png / .svg)",
    isPublic: true
  },
  {
    key: "site_app_icon_url",
    defaultValue: "/icons/icon-192x192.png",
    category: "cms",
    label: "Icon Aplikasi (PWA / Shortcut HP & Desktop)",
    description: "Icon saat website di-install ke ponsel / shortcut desktop (PNG rasio 1:1)",
    isPublic: true
  },
  // 1. Content Management (CMS)
  {
    key: "site_hero_badge",
    defaultValue: "",
    category: "cms",
    label: "Teks Badge Hero",
    description: "Teks badge di atas judul utama halaman beranda (opsional)",
    isPublic: true
  },
  {
    key: "site_hero_title",
    defaultValue: "Buat Website Undangan Pernikahan Digital Elegan dalam Hitungan Menit",
    category: "cms",
    label: "Judul Utama Hero",
    description: "Judul besar yang menarik perhatian di landing page",
    isPublic: true
  },
  {
    key: "site_hero_subtitle",
    defaultValue: "Platform all-in-one: ganti tema 1-klik tanpa data hilang, amplop digital terintegrasi (QRIS/Bank), buku tamu RSVP realtime, hingga audio player autoplay super cepat.",
    category: "cms",
    label: "Subjudul / Deskripsi Hero",
    description: "Paragraf penjelas singkat di bawah judul utama",
    isPublic: true
  },
  {
    key: "site_hero_promo",
    defaultValue: "Mulai Rp 39rb Promo Spesial",
    category: "cms",
    label: "Teks Badge Promo",
    description: "Teks keunggulan di bagian faktor kepercayaan hero",
    isPublic: true
  },
  {
    key: "announcement_enabled",
    defaultValue: "false",
    category: "cms",
    label: "Status Banner Pengumuman",
    description: "Tampilkan bilah pengumuman global di bagian atas website",
    isPublic: true
  },
  {
    key: "announcement_text",
    defaultValue: "\u{1F4E2} Info Pemeliharaan: Seluruh sistem berjalan optimal dan siap melayani pesanan Anda.",
    category: "cms",
    label: "Isi Teks Pengumuman",
    description: "Pesan yang ditampilkan di bilah pengumuman atas",
    isPublic: true
  },
  {
    key: "announcement_type",
    defaultValue: "info",
    category: "cms",
    label: "Jenis Pengumuman",
    description: "Pilihan tampilan: info (biru/abu), warning (oranye/amber), promo (hijau)",
    isPublic: true
  },
  {
    key: "support_whatsapp",
    defaultValue: "085716697416",
    category: "cms",
    label: "Nomor WhatsApp Bantuan",
    description: "Nomor CS resmi Invity by Fasaro (misal 085716697416 atau 6285716697416)",
    isPublic: true
  },
  {
    key: "support_email",
    defaultValue: "support@fasaro.id",
    category: "cms",
    label: "Email Layanan Pelanggan",
    description: "Alamat email pusat bantuan resmi",
    isPublic: true
  },
  {
    key: "support_hours",
    defaultValue: "Senin - Minggu (08:00 - 22:00 WIB)",
    category: "cms",
    label: "Jam Operasional Layanan",
    description: "Waktu aktif layanan customer support",
    isPublic: true
  },
  {
    key: "site_hero_image",
    defaultValue: "",
    category: "cms",
    label: "Gambar Mockup Hero",
    description: "Gambar mockup atau preview undangan di samping/bawah hero utama",
    isPublic: true
  },
  {
    key: "showcase_weddings_json",
    defaultValue: "[]",
    category: "cms",
    label: "Data Pengantin Live Showcase",
    description: "Daftar pernikahan live showcase dalam format JSON",
    isPublic: true
  },
  {
    key: "user_testimonials_json",
    defaultValue: "[]",
    category: "cms",
    label: "Data Testimoni Pengantin",
    description: "Daftar ulasan & testimoni dari pasangan pengantin yang menggunakan Invity",
    isPublic: true
  },
  {
    key: "site_features_badge",
    defaultValue: "Fitur Lengkap & Canggih",
    category: "cms",
    label: "Teks Badge Bagian Fitur",
    description: "Teks badge di atas judul bagian fitur unggulan beranda",
    isPublic: true
  },
  {
    key: "site_features_title",
    defaultValue: "Semua yang Anda Butuhkan untuk Hari Bahagia",
    category: "cms",
    label: "Judul Bagian Fitur",
    description: "Judul utama bagian fitur unggulan beranda",
    isPublic: true
  },
  {
    key: "site_features_subtitle",
    defaultValue: "Didesain khusus untuk mempermudah calon pengantin mempersiapkan pesta pernikahan modern.",
    category: "cms",
    label: "Subjudul Bagian Fitur",
    description: "Deskripsi singkat di bawah judul bagian fitur unggulan",
    isPublic: true
  },
  {
    key: "site_features_cards_json",
    defaultValue: JSON.stringify([
      {
        id: "f1",
        icon: "Images",
        title: "Galeri Foto (Maks. 10 Foto)",
        desc: "Tampilkan momen prewedding terbaik Anda dalam album foto beresolusi tinggi dengan batas maksimal hingga 10 foto."
      },
      {
        id: "f2",
        icon: "Wallet",
        title: "Amplop Digital & QRIS Terintegrasi",
        desc: "Tamu dapat mentransfer tanda kasih langsung melalui berbagai rekening bank dan QRIS otomatis."
      },
      {
        id: "f3",
        icon: "Users",
        title: "RSVP Cerdas & Manajemen Kuota",
        desc: "Konfirmasi kehadiran otomatis dengan batasan jumlah tamu per undangan agar jamuan lebih terkontrol."
      },
      {
        id: "f4",
        icon: "MapPin",
        title: "Navigasi Google Maps & Waze",
        desc: "Bantu tamu menemukan lokasi venue pesta Anda dengan petunjuk arah rute 1-klik langsung ke aplikasi navigasi."
      },
      {
        id: "f5",
        icon: "QrCode",
        title: "Buku Tamu Digital & QR Check-in",
        desc: "Sistem absensi tamu di meja penerima dengan scan QR Code kilat untuk mencegah antrean panjang."
      },
      {
        id: "f6",
        icon: "Headphones",
        title: "Background Music Romantis",
        desc: "Alunan musik romantis dengan pemutar melayang (floating player) dan fitur putar otomatis yang dapat disesuaikan."
      }
    ]),
    category: "cms",
    label: "Daftar Kartu Fitur Unggulan (JSON)",
    description: "Data kartu fitur (ikon, judul, deskripsi) dalam format JSON",
    isPublic: true
  },
  // 2. Pricing & Quota Limits
  {
    key: "price_starter",
    defaultValue: "39000",
    category: "cms",
    label: "Harga Paket Starter (Rp)",
    description: "Nominal harga paket Starter",
    isPublic: true
  },
  {
    key: "price_starter_original",
    defaultValue: "89000",
    category: "cms",
    label: "Harga Coret Starter (Rp)",
    description: "Nominal harga asli sebelum diskon untuk Paket Starter",
    isPublic: true
  },
  {
    key: "max_photos_starter",
    defaultValue: "10",
    category: "cms",
    label: "Maksimal Foto Starter",
    description: "Batas galeri foto untuk paket Starter",
    isPublic: true
  },
  {
    key: "max_accounts_starter",
    defaultValue: "2",
    category: "cms",
    label: "Maksimal Rekening Starter",
    description: "Batas rekening amplop digital untuk paket Starter",
    isPublic: true
  },
  {
    key: "price_elegant",
    defaultValue: "149000",
    category: "cms",
    label: "Harga Paket Elegant (Rp)",
    description: "Nominal harga paket Elegant",
    isPublic: true
  },
  {
    key: "price_elegant_original",
    defaultValue: "249000",
    category: "cms",
    label: "Harga Coret Elegant (Rp)",
    description: "Nominal harga asli sebelum diskon untuk Paket Elegant",
    isPublic: true
  },
  {
    key: "price_ultimate",
    defaultValue: "279000",
    category: "cms",
    label: "Harga Paket Ultimate (Rp)",
    description: "Nominal harga paket Ultimate",
    isPublic: true
  },
  {
    key: "price_ultimate_original",
    defaultValue: "499000",
    category: "cms",
    label: "Harga Coret Ultimate (Rp)",
    description: "Nominal harga asli sebelum diskon untuk Paket Ultimate",
    isPublic: true
  },
  // Pengaturan Single Promo Package (Semua Fitur)
  {
    key: "single_promo_mode",
    defaultValue: "true",
    category: "cms",
    label: "Mode 1 Paket Promo Saja (All-In-One)",
    description: "Jika aktif, landing page dan order page hanya menampilkan 1 paket promo yang membuka semua fitur.",
    isPublic: true
  },
  {
    key: "promo_plan_name",
    defaultValue: "Paket Promo All-In-One",
    category: "cms",
    label: "Nama Paket Promo",
    description: "Judul paket promo tunggal",
    isPublic: true
  },
  {
    key: "promo_plan_price",
    defaultValue: "79000",
    category: "cms",
    label: "Harga Paket Promo (Rp)",
    description: "Nominal harga promo yang mendapatkan semua fitur lengkap",
    isPublic: true
  },
  {
    key: "promo_plan_original_price",
    defaultValue: "249000",
    category: "cms",
    label: "Harga Coret Promo (Rp)",
    description: "Nominal harga asli sebelum diskon promo",
    isPublic: true
  },
  {
    key: "promo_plan_desc",
    defaultValue: "Satu penawaran spesial untuk seluruh momen bahagia Anda dengan semua fitur terbuka tanpa batasan.",
    category: "cms",
    label: "Deskripsi Paket Promo",
    description: "Penjelasan ringkas paket promo",
    isPublic: true
  },
  {
    key: "promo_plan_period",
    defaultValue: "Masa Aktif 1 Tahun Penuh",
    category: "cms",
    label: "Masa Aktif Paket Promo",
    description: "Keterangan masa aktif paket promo",
    isPublic: true
  },
  {
    key: "promo_plan_badge",
    defaultValue: "PROMO SPESIAL LAUNCHING \u2022 ALL FEATURES UNLOCKED",
    category: "cms",
    label: "Badge Label Promo",
    description: "Tag label di bagian atas kartu promo",
    isPublic: true
  },
  {
    key: "promo_plan_features",
    defaultValue: "Akses Semua Tema Desain Premium (Termasuk Botanical Mekar & Versa)\nBebas Ganti Tema Kapan Saja (1-Klik Tanpa Data Hilang)\nGaleri Foto HD Lengkap & Fitur Lightbox Layar Penuh\nAmplop Digital & QRIS Kasih Semua Bank / E-Wallet\nFitur Pengiriman Kado Fisik ke Kediaman Mempelai\nBuku Tamu Digital & Konfirmasi Kehadiran (RSVP) Realtime\nBackground Music Romantis Autoplay & Floating Audio Player\nPetunjuk Rute Lokasi Google Maps Terintegrasi\nQR Code Tiket Masuk Tamu Undangan\nFitur Perjalanan Cinta / Kisah Kasih (Love Story)\nHitung Mundur Acara Pernikahan (Live Countdown)\nKustomisasi Penuh Teks, Tanggal, & Foto Mempelai",
    category: "cms",
    label: "Daftar Fitur Paket Promo",
    description: "Daftar keunggulan paket promo (1 baris per fitur)",
    isPublic: true
  },
  // 2b. Matriks Fitur Paket & Template
  {
    key: "package_features_promo",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "love_story",
      "gallery",
      "countdown",
      "google_maps",
      "qr_ticket"
    ]),
    category: "cms",
    label: "Fitur Aktif Paket Promo Launching",
    description: "Daftar ID fitur yang dibuka pada paket promo launching (semua fitur)",
    isPublic: true
  },
  {
    key: "package_features_starter",
    defaultValue: JSON.stringify([
      "wishes",
      "digital_gift",
      "gallery",
      "countdown",
      "google_maps"
    ]),
    category: "cms",
    label: "Fitur Aktif Paket Starter",
    description: "Daftar ID fitur yang aktif pada paket Starter",
    isPublic: true
  },
  {
    key: "package_features_elegant",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "gallery",
      "countdown",
      "google_maps"
    ]),
    category: "cms",
    label: "Fitur Aktif Paket Elegant",
    description: "Daftar ID fitur yang aktif pada paket Elegant",
    isPublic: true
  },
  {
    key: "package_features_ultimate",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "love_story",
      "gallery",
      "countdown",
      "google_maps",
      "qr_ticket"
    ]),
    category: "cms",
    label: "Fitur Aktif Paket Ultimate",
    description: "Daftar ID fitur yang aktif pada paket Ultimate",
    isPublic: true
  },
  {
    key: "template_features_botanical",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "love_story",
      "gallery",
      "countdown",
      "google_maps",
      "qr_ticket"
    ]),
    category: "cms",
    label: "Fitur Aktif Botanical Tema 01",
    description: "Fitur yang tersedia pada tema Botanical",
    isPublic: true
  },
  {
    key: "template_features_editorial",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "love_story",
      "gallery",
      "countdown",
      "google_maps",
      "qr_ticket"
    ]),
    category: "cms",
    label: "Fitur Aktif Editorial Tema 01",
    description: "Fitur yang tersedia pada tema Editorial",
    isPublic: true
  },
  {
    key: "template_features_gothic",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "love_story",
      "gallery",
      "countdown",
      "google_maps",
      "qr_ticket"
    ]),
    category: "cms",
    label: "Fitur Aktif Gothic Tema 01",
    description: "Fitur yang tersedia pada tema Gothic",
    isPublic: true
  },
  {
    key: "template_features_raka-ayu",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "love_story",
      "gallery",
      "countdown",
      "google_maps",
      "qr_ticket"
    ]),
    category: "cms",
    label: "Fitur Aktif Royal Tema 01 (Raka & Ayu)",
    description: "Fitur yang tersedia pada tema Raka Ayu / Royal",
    isPublic: true
  },
  {
    key: "template_features_wedding-3d",
    defaultValue: JSON.stringify([
      "music",
      "rsvp",
      "wishes",
      "digital_gift",
      "physical_gift",
      "love_story",
      "gallery",
      "countdown",
      "google_maps",
      "qr_ticket"
    ]),
    category: "cms",
    label: "Fitur Aktif 3D Tema 01",
    description: "Fitur yang tersedia pada tema 3D",
    isPublic: true
  },
  // Content Kustomisasi Paket
  {
    key: "plan_starter_name",
    defaultValue: "Paket Starter",
    category: "cms",
    label: "Nama Paket Starter",
    description: "Judul paket Starter",
    isPublic: true
  },
  {
    key: "plan_starter_desc",
    defaultValue: "Untuk syukuran intim keluarga.",
    category: "cms",
    label: "Deskripsi Paket Starter",
    description: "Subjudul penjelasan paket Starter",
    isPublic: true
  },
  {
    key: "plan_starter_period",
    defaultValue: "Masa Aktif 3 Bulan",
    category: "cms",
    label: "Masa Aktif Paket Starter",
    description: "Keterangan masa aktif paket Starter",
    isPublic: true
  },
  {
    key: "plan_starter_badge",
    defaultValue: "Entry Tier",
    category: "cms",
    label: "Badge Label Starter",
    description: "Label tag kecil di atas kartu paket Starter",
    isPublic: true
  },
  {
    key: "plan_starter_features",
    defaultValue: "1 Pilihan Tema Minimalist\nMasa Aktif 90 Hari\nGaleri hingga 10 Foto\nAmplop (2 Rekening Bank)\nBuku Ucapan & Doa\nNavigasi Google Maps",
    category: "cms",
    label: "Daftar Fitur Paket Starter",
    description: "Daftar poin keunggulan paket Starter (1 baris per fitur)",
    isPublic: true
  },
  {
    key: "plan_elegant_name",
    defaultValue: "Paket Elegant",
    category: "cms",
    label: "Nama Paket Elegant",
    description: "Judul paket Elegant",
    isPublic: true
  },
  {
    key: "plan_elegant_desc",
    defaultValue: "Untuk resepsi lengkap & modern.",
    category: "cms",
    label: "Deskripsi Paket Elegant",
    description: "Subjudul penjelasan paket Elegant",
    isPublic: true
  },
  {
    key: "plan_elegant_period",
    defaultValue: "Masa Aktif 1 Tahun Penuh",
    category: "cms",
    label: "Masa Aktif Paket Elegant",
    description: "Keterangan masa aktif paket Elegant",
    isPublic: true
  },
  {
    key: "plan_elegant_badge",
    defaultValue: "Paling Populer",
    category: "cms",
    label: "Badge Label Elegant",
    description: "Label tag badge di atas kartu paket Elegant",
    isPublic: true
  },
  {
    key: "plan_elegant_features",
    defaultValue: "Akses Semua Tema Desain\nGanti Tema 1-Klik Bebas\nMasa Aktif 365 Hari\nGaleri Foto HD Tanpa Batas\nAmplop Bebas + QRIS Donasi\nBuku Tamu & RSVP Realtime\nBackground Musik Autoplay",
    category: "cms",
    label: "Daftar Fitur Paket Elegant",
    description: "Daftar poin keunggulan paket Elegant (1 baris per fitur)",
    isPublic: true
  },
  {
    key: "plan_ultimate_name",
    defaultValue: "Ultimate Event Day",
    category: "cms",
    label: "Nama Paket Ultimate",
    description: "Judul paket Ultimate",
    isPublic: true
  },
  {
    key: "plan_ultimate_desc",
    defaultValue: "Solusi hari-H check-in tamu VIP.",
    category: "cms",
    label: "Deskripsi Paket Ultimate",
    description: "Subjudul penjelasan paket Ultimate",
    isPublic: true
  },
  {
    key: "plan_ultimate_period",
    defaultValue: "Masa Aktif Selamanya",
    category: "cms",
    label: "Masa Aktif Paket Ultimate",
    description: "Keterangan masa aktif paket Ultimate",
    isPublic: true
  },
  {
    key: "plan_ultimate_badge",
    defaultValue: "VIP Hari-H",
    category: "cms",
    label: "Badge Label Ultimate",
    description: "Label tag badge di atas kartu paket Ultimate",
    isPublic: true
  },
  {
    key: "plan_ultimate_features",
    defaultValue: "Seluruh Fitur Paket Elegant\nMasa Aktif Selamanya (Lifetime)\nQR Code Check-in Meja Tamu\nWhatsApp Blast Generator\nLove Story Timeline Kustom\nPrioritas Verifikasi Kilat 10 Menit\nDukungan WhatsApp Prioritas",
    category: "cms",
    label: "Daftar Fitur Paket Ultimate",
    description: "Daftar poin keunggulan paket Ultimate (1 baris per fitur)",
    isPublic: true
  },
  // 3. Maintenance Mode & Website Flags
  {
    key: "maintenance_mode",
    defaultValue: "false",
    category: "maintenance",
    label: "Mode Pemeliharaan Website",
    description: "Jika aktif, pengunjung akan melihat halaman pemeliharaan",
    isPublic: true
  },
  {
    key: "maintenance_title",
    defaultValue: "Website Sedang Dalam Pemeliharaan Terjadwal",
    category: "maintenance",
    label: "Judul Halaman Pemeliharaan",
    description: "Judul utama saat mode pemeliharaan aktif",
    isPublic: true
  },
  {
    key: "maintenance_message",
    defaultValue: "Kami sedang melakukan pembaruan infrastruktur server untuk meningkatkan performa dan stabilitas layanan. Seluruh data Anda aman dan website akan segera kembali normal.",
    category: "maintenance",
    label: "Pesan Detail Pemeliharaan",
    description: "Pesan yang dibaca pengunjung saat maintenance",
    isPublic: true
  },
  {
    key: "maintenance_estimated_end",
    defaultValue: "Segera kembali dalam beberapa saat",
    category: "maintenance",
    label: "Estimasi Selesai",
    description: "Perkiraan waktu pemeliharaan berakhir",
    isPublic: true
  },
  // 4. Feature Flags (Saklar Fitur)
  {
    key: "feature_registration",
    defaultValue: "true",
    category: "feature",
    label: "Pendaftaran Akun Baru",
    description: "Izinkan pengguna baru mendaftar akun di Invity",
    isPublic: true
  },
  {
    key: "feature_midtrans_payment",
    defaultValue: "true",
    category: "feature",
    label: "Payment Gateway Midtrans",
    description: "Aktifkan checkout pembayaran otomatis melalui Midtrans",
    isPublic: true
  },
  {
    key: "feature_manual_payment",
    defaultValue: "true",
    category: "feature",
    label: "Transfer Manual Bank & QRIS",
    description: "Aktifkan opsi transfer manual dan upload bukti bayar",
    isPublic: true
  },
  {
    key: "feature_digital_gift",
    defaultValue: "true",
    category: "feature",
    label: "Fitur Amplop Digital Kado",
    description: "Tampilkan kotak amplop hadiah di seluruh undangan",
    isPublic: true
  },
  {
    key: "feature_rsvp",
    defaultValue: "true",
    category: "feature",
    label: "Fitur Konfirmasi RSVP",
    description: "Tampilkan form kehadiran tamu di seluruh undangan",
    isPublic: true
  },
  {
    key: "feature_wishes",
    defaultValue: "true",
    category: "feature",
    label: "Fitur Buku Tamu & Doa Ucapan",
    description: "Tampilkan buku tamu interaktif di seluruh undangan",
    isPublic: true
  },
  {
    key: "feature_music",
    defaultValue: "true",
    category: "feature",
    label: "Fitur Musik Latar (Autoplay)",
    description: "Aktifkan tombol audio musik di seluruh undangan",
    isPublic: true
  },
  {
    key: "feature_pwa_banner",
    defaultValue: "true",
    category: "feature",
    label: "Banner Unduh Aplikasi PWA",
    description: "Tampilkan prompt instalasi PWA di perangkat mobile",
    isPublic: true
  },
  // Setting Fitur Per Paket Langganan
  {
    key: "package_features_promo",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Paket Promo (All-In-One)",
    description: "Daftar fitur aktif untuk Paket Promo Launching (JSON array)",
    isPublic: true
  },
  {
    key: "package_features_ultimate",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Paket Ultimate",
    description: "Daftar fitur aktif untuk Paket Ultimate (JSON array)",
    isPublic: true
  },
  {
    key: "package_features_elegant",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Paket Elegant",
    description: "Daftar fitur aktif untuk Paket Elegant (JSON array)",
    isPublic: true
  },
  {
    key: "package_features_starter",
    defaultValue: '["gallery","countdown","google_maps","wishes","digital_gift"]',
    category: "feature",
    label: "Fitur Paket Starter",
    description: "Daftar fitur aktif untuk Paket Starter (JSON array)",
    isPublic: true
  },
  // Setting Fitur Per Template Desain
  {
    key: "template_features_botanical",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Tersedia Botanical Tema 01",
    description: "Fitur yang diaktifkan untuk template Botanical Tema 01",
    isPublic: true
  },
  {
    key: "template_features_editorial",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Tersedia Editorial Tema 01",
    description: "Fitur yang diaktifkan untuk template Editorial Tema 01",
    isPublic: true
  },
  {
    key: "template_features_gothic",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Tersedia Gothic Tema 01",
    description: "Fitur yang diaktifkan untuk template Gothic Tema 01",
    isPublic: true
  },
  {
    key: "template_features_raka-ayu",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Tersedia Royal Tema 01",
    description: "Fitur yang diaktifkan untuk template Royal Tema 01",
    isPublic: true
  },
  {
    key: "template_features_wedding-3d",
    defaultValue: '["music","rsvp","wishes","digital_gift","physical_gift","love_story","gallery","countdown","google_maps","qr_ticket"]',
    category: "feature",
    label: "Fitur Tersedia 3D Tema 01",
    description: "Fitur yang diaktifkan untuk template 3D Tema 01",
    isPublic: true
  },
  // 5. Gateway & Technical Configuration
  {
    key: "payment_active_mode",
    defaultValue: "MANUAL_ONLY",
    category: "gateway",
    label: "Mode Pembayaran Aktif",
    description: "Pilihan mode pembayaran saat ini: MANUAL_ONLY (Hanya Transfer Manual), BOTH (Keduanya), GATEWAY_ONLY (Hanya Midtrans)",
    isPublic: true
  },
  {
    key: "midtrans_server_key",
    defaultValue: "SB-Mid-server-YOUR_SANDBOX_SERVER_KEY",
    category: "gateway",
    label: "Midtrans Server Key",
    description: "Kunci server otentikasi API Midtrans Sandbox/Production",
    isPublic: false
  },
  {
    key: "manual_bank_name",
    defaultValue: "BCA",
    category: "gateway",
    label: "Nama Bank Transfer Manual",
    description: "Nama bank untuk transfer manual (misal BCA, Bank Mandiri, BRI, BNI)",
    isPublic: true
  },
  {
    key: "manual_account_number",
    defaultValue: "8291039481",
    category: "gateway",
    label: "Nomor Rekening Bank",
    description: "Nomor rekening tujuan transfer pembayaran",
    isPublic: true
  },
  {
    key: "manual_account_holder",
    defaultValue: "PT Fasaro Digital",
    category: "gateway",
    label: "Atas Nama Pemilik Rekening",
    description: "Nama pemilik rekening bank resmi Fasaro",
    isPublic: true
  },
  {
    key: "manual_whatsapp_confirmation",
    defaultValue: "085716697416",
    category: "gateway",
    label: "Nomor WhatsApp Konfirmasi Manual",
    description: "Nomor WhatsApp CS/Admin untuk menerima konfirmasi bukti transfer",
    isPublic: true
  },
  {
    key: "manual_payment_instructions",
    defaultValue: "Transfer sesuai nominal paket ke rekening di atas. Setelah transfer, upload bukti transfer di form ini atau kirimkan konfirmasi via WhatsApp agar paket Anda segera diaktifkan.",
    category: "gateway",
    label: "Instruksi Transfer Manual",
    description: "Catatan panduan langkah pembayaran transfer manual bagi klien",
    isPublic: true
  },
  {
    key: "manual_qris_bank_info",
    defaultValue: "BCA 8291039481 a/n PT Fasaro Digital",
    category: "gateway",
    label: "Informasi Bank Transfer Invity by Fasaro (Ringkasan)",
    description: "Nomor rekening dan bank tujuan transfer manual klien",
    isPublic: true
  },
  {
    key: "manual_qris_image_url",
    defaultValue: "",
    category: "gateway",
    label: "URL Gambar QRIS Invity by Fasaro",
    description: "Link gambar QRIS statis resmi Invity",
    isPublic: true
  },
  {
    key: "max_photo_upload",
    defaultValue: "20",
    category: "gateway",
    label: "Batas Default Unggah Foto",
    description: "Batas foto unggahan per undangan secara global",
    isPublic: false
  }
];
async function getAllSettingsMap() {
  const dbSettings = await prisma_default.systemSetting.findMany();
  const map = {};
  for (const def of SYSTEM_SETTING_DEFINITIONS) {
    map[def.key] = def.defaultValue;
  }
  for (const s of dbSettings) {
    map[s.key] = s.value;
  }
  return map;
}
async function getPublicSettingsMap() {
  const all = await getAllSettingsMap();
  const publicMap = {};
  for (const def of SYSTEM_SETTING_DEFINITIONS) {
    if (def.isPublic) {
      publicMap[def.key] = all[def.key] ?? def.defaultValue;
    }
  }
  return publicMap;
}

// server/services/sanity.service.ts
import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config();
function getSanityConfig() {
  const projectId = process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || "";
  const dataset = process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || "production";
  const apiVersion = process.env.SANITY_API_VERSION || process.env.VITE_SANITY_API_VERSION || "2024-01-01";
  const token = process.env.SANITY_API_TOKEN || "";
  return { projectId, dataset, apiVersion, token };
}
var cachedClient = null;
function getSanityClient() {
  if (cachedClient) return cachedClient;
  const { projectId, dataset, apiVersion, token } = getSanityConfig();
  if (!projectId || !token) return null;
  cachedClient = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false
  });
  return cachedClient;
}
async function syncInvitationToSanity(invitation) {
  const client = getSanityClient();
  if (!client) {
    return {
      success: false,
      error: "Sanity client belum terkonfigurasi (SANITY_PROJECT_ID atau SANITY_API_TOKEN kosong)"
    };
  }
  try {
    const documentId = `invitation-${invitation.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const coupleInfo = invitation.coupleInfo || {};
    const sanityDoc = {
      _id: documentId,
      _type: "weddingInvitation",
      invitationId: invitation.id,
      slug: invitation.slug,
      title: invitation.title,
      themeId: invitation.themeId || "botanical",
      isActive: Boolean(invitation.isActive),
      activeUntil: invitation.activeUntil ? new Date(invitation.activeUntil).toISOString() : null,
      coupleInfo: {
        groomName: coupleInfo.groomName || "",
        groomNickname: coupleInfo.groomNickname || "",
        groomFather: coupleInfo.groomFather || "",
        groomMother: coupleInfo.groomMother || "",
        groomInstagram: coupleInfo.groomInstagram || "",
        groomPhoto: coupleInfo.groomPhoto || "",
        brideName: coupleInfo.brideName || "",
        brideNickname: coupleInfo.brideNickname || "",
        brideFather: coupleInfo.brideFather || "",
        brideMother: coupleInfo.brideMother || "",
        brideInstagram: coupleInfo.brideInstagram || "",
        bridePhoto: coupleInfo.bridePhoto || "",
        greetingMessage: coupleInfo.greetingMessage || "",
        stories: Array.isArray(coupleInfo.stories) ? coupleInfo.stories : [],
        musicUrl: coupleInfo.musicUrl || null,
        youtubeVideoUrl: coupleInfo.youtubeVideoUrl || null,
        giftAddress: coupleInfo.giftAddress || null,
        giftReceiver: coupleInfo.giftReceiver || null,
        giftPhone: coupleInfo.giftPhone || null,
        backgroundImage: coupleInfo.backgroundImage || null,
        floralOrnament: coupleInfo.floralOrnament || null
      },
      eventSchedules: (invitation.eventSchedules || []).map((s, idx) => ({
        _key: `schedule-${idx}`,
        eventName: s.eventName,
        date: new Date(s.date).toISOString(),
        startTime: s.startTime,
        endTime: s.endTime || null,
        venueName: s.venueName,
        address: s.address,
        mapsUrl: s.mapsUrl || null,
        latitude: s.latitude || null,
        longitude: s.longitude || null
      })),
      galleries: (invitation.galleries || []).map((g, idx) => ({
        _key: `gallery-${idx}`,
        imageUrl: g.imageUrl,
        caption: g.caption || null,
        sortOrder: g.sortOrder !== void 0 ? g.sortOrder : idx
      })),
      bankAccounts: (invitation.bankAccounts || []).map((b, idx) => ({
        _key: `bank-${idx}`,
        bankName: b.bankName,
        accountNumber: b.accountNumber,
        accountHolder: b.accountHolder,
        qrisImageUrl: b.qrisImageUrl || null
      })),
      syncedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const result = await client.createOrReplace(sanityDoc);
    return { success: true, sanityId: result._id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Gagal sinkron ke Sanity";
    console.error("[SanitySync] Error syncing invitation to Sanity:", errorMsg);
    return { success: false, error: errorMsg };
  }
}
async function syncCmsSettingsToSanity(settings) {
  const client = getSanityClient();
  if (!client) {
    return {
      success: false,
      error: "Sanity client belum terkonfigurasi"
    };
  }
  try {
    const settingsMap = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }
    const sanityDoc = {
      _id: "siteSettings-global",
      _type: "siteSettings",
      title: "Fasaro Invity - Global Site Settings",
      settings: settingsMap,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const result = await client.createOrReplace(sanityDoc);
    return { success: true, sanityId: result._id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Gagal sinkron CMS settings ke Sanity";
    console.error("[SanitySync] Error syncing settings to Sanity:", errorMsg);
    return { success: false, error: errorMsg };
  }
}
async function testSanityConnection() {
  const { projectId, dataset } = getSanityConfig();
  const client = getSanityClient();
  if (!client) {
    return {
      connected: false,
      latencyMs: 0,
      projectId,
      dataset,
      error: "Sanity belum terkonfigurasi di file .env"
    };
  }
  const start = Date.now();
  try {
    const count = await client.fetch('count(*[_type in ["weddingInvitation", "themeTemplate", "siteSettings"]])');
    const latencyMs = Date.now() - start;
    return {
      connected: true,
      latencyMs,
      projectId,
      dataset,
      documentCount: count
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      connected: false,
      latencyMs,
      projectId,
      dataset,
      error: error instanceof Error ? error.message : "Gagal terhubung ke Sanity API"
    };
  }
}
var OFFICIAL_THEMES_SEED = [
  {
    themeKey: "botanical",
    name: "Botanical Tema 01",
    category: "Botanical",
    thumbnail: "/templates/botanical/cover.jpg",
    previewUrl: "/invitation/demo-botanical",
    isPremium: false,
    isActive: true,
    features: [
      "hero_cover",
      "couple_profile",
      "event_schedule",
      "google_maps",
      "love_story",
      "gallery_photo",
      "wishes_guestbook",
      "rsvp_attendance",
      "digital_envelope",
      "floating_music"
    ],
    designConfig: {
      primaryColor: "#4B5320",
      accentColor: "#F97316",
      fontFamily: "Outfit, sans-serif"
    }
  },
  {
    themeKey: "editorial",
    name: "Editorial Tema 01",
    category: "Editorial",
    thumbnail: "/templates/editorial/cover.jpg",
    previewUrl: "/invitation/demo-editorial",
    isPremium: false,
    isActive: true,
    features: [
      "hero_cover",
      "couple_profile",
      "event_schedule",
      "google_maps",
      "love_story",
      "gallery_photo",
      "wishes_guestbook",
      "rsvp_attendance",
      "digital_envelope",
      "floating_music"
    ],
    designConfig: {
      primaryColor: "#1E293B",
      accentColor: "#F97316",
      fontFamily: "Playfair Display, serif"
    }
  },
  {
    themeKey: "gothic",
    name: "Gothic Tema 01",
    category: "Gothic",
    thumbnail: "/templates/gothic/cover.jpg",
    previewUrl: "/invitation/demo-gothic",
    isPremium: false,
    isActive: true,
    features: [
      "hero_cover",
      "couple_profile",
      "event_schedule",
      "google_maps",
      "love_story",
      "gallery_photo",
      "wishes_guestbook",
      "rsvp_attendance",
      "digital_envelope",
      "floating_music"
    ],
    designConfig: {
      primaryColor: "#0F172A",
      accentColor: "#D97706",
      fontFamily: "Cinzel, serif"
    }
  },
  {
    themeKey: "raka-ayu",
    name: "Royal Tema 01",
    category: "Royal",
    thumbnail: "/templates/raka-ayu/cover.jpg",
    previewUrl: "/invitation/demo-raka-ayu",
    isPremium: false,
    isActive: true,
    features: [
      "hero_cover",
      "couple_profile",
      "event_schedule",
      "google_maps",
      "love_story",
      "gallery_photo",
      "wishes_guestbook",
      "rsvp_attendance",
      "digital_envelope",
      "floating_music",
      "qr_ticket"
    ],
    designConfig: {
      primaryColor: "#064E3B",
      accentColor: "#D97706",
      fontFamily: "Cinzel Decorative, serif"
    }
  },
  {
    themeKey: "wedding-3d",
    name: "3D Tema 01",
    category: "3D",
    thumbnail: "/templates/wedding-3d/cover.jpg",
    previewUrl: "/invitation/demo-wedding-3d",
    isPremium: false,
    isActive: true,
    features: [
      "hero_cover",
      "couple_profile",
      "event_schedule",
      "google_maps",
      "love_story",
      "gallery_photo",
      "wishes_guestbook",
      "rsvp_attendance",
      "digital_envelope",
      "floating_music",
      "interactive_3d",
      "qr_ticket"
    ],
    designConfig: {
      primaryColor: "#1E1B4B",
      accentColor: "#F97316",
      fontFamily: "Outfit, sans-serif"
    }
  }
];
async function getSanityThemes() {
  const client = getSanityClient();
  if (!client) return [];
  try {
    const themes = await client.fetch(
      `*[_type == "themeTemplate"] | order(createdAt asc)`
    );
    return themes;
  } catch (error) {
    console.error("[SanityService] Error fetching themes from Sanity:", error);
    return [];
  }
}
async function getSanityThemeByKey(themeKey) {
  const client = getSanityClient();
  if (!client) return null;
  try {
    const theme = await client.fetch(
      `*[_type == "themeTemplate" && themeKey == $key][0]`,
      { key: themeKey.toLowerCase().trim() }
    );
    return theme;
  } catch (error) {
    console.error(`[SanityService] Error fetching theme ${themeKey}:`, error);
    return null;
  }
}
async function createOrUpdateSanityTheme(themeData) {
  const client = getSanityClient();
  if (!client) {
    return { success: false, error: "Sanity client belum siap" };
  }
  try {
    const cleanKey = themeData.themeKey.toLowerCase().trim();
    const docId = `theme-${cleanKey.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const doc = {
      _id: docId,
      _type: "themeTemplate",
      themeKey: cleanKey,
      name: themeData.name || cleanKey,
      category: themeData.category || "Minimalist",
      thumbnail: themeData.thumbnail || "",
      previewUrl: themeData.previewUrl || `/invitation/demo-${cleanKey}`,
      isPremium: Boolean(themeData.isPremium),
      isActive: themeData.isActive !== void 0 ? Boolean(themeData.isActive) : true,
      features: Array.isArray(themeData.features) ? themeData.features : [],
      designConfig: themeData.designConfig || {},
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = await client.createOrReplace(doc);
    return { success: true, theme: saved };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal menyimpan tema ke Sanity";
    console.error("[SanityService] Error saving theme:", msg);
    return { success: false, error: msg };
  }
}
async function deleteSanityTheme(themeKey) {
  const client = getSanityClient();
  if (!client) {
    return { success: false, error: "Sanity client belum siap" };
  }
  try {
    const cleanKey = themeKey.toLowerCase().trim();
    const docId = `theme-${cleanKey.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    await client.delete(docId);
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus tema di Sanity";
    console.error("[SanityService] Error deleting theme in Sanity:", msg);
    return { success: false, error: msg };
  }
}
async function uploadSanityAsset(buffer, filename, contentType) {
  const client = getSanityClient();
  if (!client) {
    return { success: false, error: "Sanity client belum terkonfigurasi" };
  }
  try {
    const asset = await client.assets.upload("image", buffer, {
      filename,
      contentType
    });
    return {
      success: true,
      url: asset.url,
      assetId: asset._id
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal upload aset ke Sanity CDN";
    console.error("[SanityService] Error uploading asset to Sanity:", msg);
    return { success: false, error: msg };
  }
}
async function getSanityCmsSettings() {
  const client = getSanityClient();
  if (!client) return null;
  try {
    const doc = await client.fetch(
      `*[_id == "siteSettings-global"][0]`
    );
    return doc?.settings || null;
  } catch (error) {
    console.error("[SanityService] Error fetching CMS settings from Sanity:", error);
    return null;
  }
}
async function seedDefaultThemesToSanity() {
  const client = getSanityClient();
  if (!client) return [];
  try {
    const existingThemes = await client.fetch(
      `*[_type == "themeTemplate"]`
    );
    if (existingThemes.length >= OFFICIAL_THEMES_SEED.length) {
      return existingThemes;
    }
    const existingKeys = new Set(existingThemes.map((t) => t.themeKey));
    const created = [...existingThemes];
    for (const seed of OFFICIAL_THEMES_SEED) {
      if (!existingKeys.has(seed.themeKey)) {
        const res = await createOrUpdateSanityTheme(seed);
        if (res.theme) {
          created.push(res.theme);
        }
      }
    }
    return created;
  } catch (error) {
    console.error("[SanityService] Error seeding default themes to Sanity:", error);
    return [];
  }
}

// server/services/analytics.service.ts
import crypto3 from "crypto";
function parseDeviceType(userAgent) {
  if (!userAgent) return "mobile";
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent) ? "mobile" : "desktop";
}
function parseBrowser(userAgent) {
  if (!userAgent) return "Unknown";
  if (/Edg\//i.test(userAgent)) return "Edge";
  if (/Chrome\//i.test(userAgent)) return "Chrome";
  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) return "Safari";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  return "Browser";
}
function hashIp(ip) {
  if (!ip) return "anonymous";
  return crypto3.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}
function generateCuidLikeId() {
  return "view_" + crypto3.randomBytes(12).toString("hex");
}
async function recordInvitationVisit(invitationId, options) {
  if (!invitationId) return false;
  try {
    const ipHash = hashIp(options.ip);
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1e3);
    const existing = await prisma_default.$queryRaw`
      SELECT "id" FROM invitation_views
      WHERE "invitationId" = ${invitationId}
        AND "ipHash" = ${ipHash}
        AND "visitedAt" >= ${fifteenMinutesAgo}
      LIMIT 1
    `;
    if (existing && existing.length > 0) {
      return false;
    }
    const id = generateCuidLikeId();
    const deviceType = parseDeviceType(options.userAgent);
    const browser = parseBrowser(options.userAgent);
    const guestName = options.guestName?.trim() || null;
    await prisma_default.$executeRaw`
      INSERT INTO invitation_views ("id", "invitationId", "guestName", "deviceType", "browser", "ipHash", "visitedAt")
      VALUES (${id}, ${invitationId}, ${guestName}, ${deviceType}, ${browser}, ${ipHash}, NOW())
    `;
    return true;
  } catch (error) {
    console.error("Gagal mencatat statistik kunjungan undangan:", error);
    return false;
  }
}
async function getInvitationAnalytics(invitationId) {
  if (!invitationId) {
    return { totalViews: 0, todayViews: 0, mobilePercent: 100 };
  }
  try {
    const [totalRows, todayRows, mobileRows] = await Promise.all([
      prisma_default.$queryRaw`
        SELECT COUNT(*)::bigint as count FROM invitation_views
        WHERE "invitationId" = ${invitationId}
      `,
      prisma_default.$queryRaw`
        SELECT COUNT(*)::bigint as count FROM invitation_views
        WHERE "invitationId" = ${invitationId}
          AND "visitedAt" >= CURRENT_DATE
      `,
      prisma_default.$queryRaw`
        SELECT COUNT(*)::bigint as count FROM invitation_views
        WHERE "invitationId" = ${invitationId}
          AND "deviceType" = 'mobile'
      `
    ]);
    const totalViews = Number(totalRows[0]?.count || 0);
    const todayViews = Number(todayRows[0]?.count || 0);
    const mobileCount = Number(mobileRows[0]?.count || 0);
    const mobilePercent = totalViews > 0 ? Math.round(mobileCount / totalViews * 100) : 100;
    return {
      totalViews,
      todayViews,
      mobilePercent
    };
  } catch (error) {
    console.error("Gagal mengambil analitik undangan:", error);
    return { totalViews: 0, todayViews: 0, mobilePercent: 100 };
  }
}
var activeVisitorsMap = /* @__PURE__ */ new Map();
function recordVisitorHeartbeat(slug, visitorId) {
  if (!slug || !visitorId) return 0;
  const cleanSlug = slug.toLowerCase().trim();
  let sessions = activeVisitorsMap.get(cleanSlug);
  if (!sessions) {
    sessions = /* @__PURE__ */ new Map();
    activeVisitorsMap.set(cleanSlug, sessions);
  }
  sessions.set(visitorId, {
    visitorId,
    lastSeen: Date.now()
  });
  const now = Date.now();
  for (const [id, s] of sessions.entries()) {
    if (now - s.lastSeen > 35e3) {
      sessions.delete(id);
    }
  }
  return sessions.size;
}
function removeVisitorSession(slug, visitorId) {
  if (!slug || !visitorId) return 0;
  const cleanSlug = slug.toLowerCase().trim();
  const sessions = activeVisitorsMap.get(cleanSlug);
  if (sessions) {
    sessions.delete(visitorId);
    return sessions.size;
  }
  return 0;
}
function getLiveVisitorsCount(slug) {
  if (!slug) return 0;
  const cleanSlug = slug.toLowerCase().trim();
  const sessions = activeVisitorsMap.get(cleanSlug);
  if (!sessions) return 0;
  const now = Date.now();
  let count = 0;
  for (const [id, s] of sessions.entries()) {
    if (now - s.lastSeen <= 35e3) {
      count++;
    } else {
      sessions.delete(id);
    }
  }
  return count;
}

// server/controllers/public.controller.ts
function stripHtml(input) {
  return input.replace(/<[^>]*>/g, "").trim();
}
var INITIAL_DEMO_WISHES = [
  {
    id: "demo-w-1",
    senderName: "Budi & Ani Santoso",
    message: "Barakallahu lakum wa baraka alaikum. Selamat menempuh hidup baru untuk kedua mempelai!",
    reaction: "\u{1F496}",
    createdAt: new Date(Date.now() - 36e5 * 2).toISOString()
  },
  {
    id: "demo-w-2",
    senderName: "Keluarga Besar Bpk. Hendra",
    message: "Semoga menjadi keluarga yang sakinah, mawaddah, dan warahmah. Bahagia selalu selamanya.",
    reaction: "\u{1F932}",
    createdAt: new Date(Date.now() - 36e5 * 5).toISOString()
  },
  {
    id: "demo-w-3",
    senderName: "Dinda & Sahabat Kampus",
    message: "Selamat yaa! Senang sekali melihat kalian berdua bersanding di pelaminan. Lancar sampai hari H!",
    reaction: "\u2728",
    createdAt: new Date(Date.now() - 36e5 * 12).toISOString()
  }
];
async function getPublicInvitation(req, res, next) {
  try {
    const rawSlug = req.params.slug;
    const slug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug) || "";
    if (!slug) {
      res.status(400).json({ error: "Slug wajib disertakan" });
      return;
    }
    const [invitation, publicSettings] = await Promise.all([
      getCachedPublicInvitation(slug),
      getPublicSettingsMap()
    ]);
    if (!invitation) {
      res.status(404).json({ error: "Undangan tidak ditemukan atau sedang tidak aktif" });
      return;
    }
    let sanityTheme = null;
    if (invitation.themeId) {
      sanityTheme = await getSanityThemeByKey(invitation.themeId).catch(() => null);
    }
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || req.ip;
    recordInvitationVisit(invitation.id, {
      guestName: typeof req.query.to === "string" ? req.query.to : null,
      userAgent: req.headers["user-agent"],
      ip: clientIp
    }).catch(() => {
    });
    res.json({
      data: {
        ...invitation,
        systemSettings: publicSettings,
        themeConfig: sanityTheme?.designConfig || null,
        themeAssets: {
          thumbnail: sanityTheme?.thumbnail || null,
          source: sanityTheme ? "sanity_cms" : "local"
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
async function recordPublicInvitationVisit(req, res, next) {
  try {
    const rawSlug = req.params.slug;
    const slug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug) || "";
    if (!slug) {
      res.status(400).json({ error: "Slug wajib disertakan" });
      return;
    }
    const invitation = await getCachedPublicInvitation(slug);
    if (!invitation) {
      res.status(404).json({ error: "Undangan tidak ditemukan" });
      return;
    }
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || req.ip;
    const recorded = await recordInvitationVisit(invitation.id, {
      guestName: typeof req.body?.guestName === "string" ? req.body.guestName : null,
      userAgent: req.headers["user-agent"],
      ip: clientIp
    });
    res.json({ success: true, recorded });
  } catch (error) {
    next(error);
  }
}
async function handleVisitorHeartbeat(req, res, next) {
  try {
    const rawSlug = req.params.slug;
    const slug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug) || "";
    const visitorId = req.body?.visitorId || "anon_" + req.ip;
    if (!slug) {
      res.status(400).json({ error: "Slug wajib disertakan" });
      return;
    }
    const liveCount = recordVisitorHeartbeat(slug, visitorId);
    getCachedPublicInvitation(slug).then((invitation) => {
      if (invitation) {
        const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || req.ip;
        recordInvitationVisit(invitation.id, {
          guestName: typeof req.body?.guestName === "string" ? req.body.guestName : null,
          userAgent: req.headers["user-agent"],
          ip: clientIp
        }).catch(() => {
        });
      }
    }).catch(() => {
    });
    res.json({ success: true, liveCount });
  } catch (error) {
    next(error);
  }
}
async function handleVisitorLeave(req, res, next) {
  try {
    const rawSlug = req.params.slug;
    const slug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug) || "";
    const visitorId = req.body?.visitorId || "anon_" + req.ip;
    const liveCount = removeVisitorSession(slug, visitorId);
    res.json({ success: true, liveCount });
  } catch (error) {
    next(error);
  }
}
async function getLiveVisitors(req, res, next) {
  try {
    const rawSlug = req.params.slug;
    const slug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug) || "";
    const liveCount = getLiveVisitorsCount(slug);
    res.json({ success: true, liveCount });
  } catch (error) {
    next(error);
  }
}
async function submitRsvp(req, res, next) {
  try {
    const parsed = rsvpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi formulir RSVP gagal",
        details: parsed.error.format()
      });
      return;
    }
    const { invitationId, guestName, status, attendeeCount, sessionChosen } = parsed.data;
    if (KNOWN_DEMO_SLUGS.includes(invitationId)) {
      res.status(201).json({
        message: "Konfirmasi kehadiran berhasil dikirim (Demo Mode)",
        data: {
          id: `demo-rsvp-${Date.now()}`,
          invitationId,
          guestName,
          status,
          attendeeCount: attendeeCount ?? 1,
          sessionChosen: sessionChosen ?? null,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      return;
    }
    const invitation = await getInvitationMeta(invitationId);
    if (!invitation || !invitation.isActive) {
      res.status(404).json({
        error: "Undangan tidak ditemukan atau sedang dinonaktifkan oleh pemilik"
      });
      return;
    }
    const cleanGuestName = stripHtml(guestName);
    const rsvp = await prisma_default.rsvp.create({
      data: {
        invitationId: invitation.id,
        guestName: cleanGuestName,
        status,
        attendeeCount: attendeeCount ?? 1,
        sessionChosen: sessionChosen || null
      }
    });
    invalidateInvitationCache(invitationId, invitation.id);
    res.status(201).json({
      message: "Konfirmasi kehadiran berhasil disimpan",
      data: rsvp
    });
  } catch (error) {
    next(error);
  }
}
async function getWishes(req, res, next) {
  try {
    const invitationId = req.query.invitationId;
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);
    const cursor = req.query.cursor;
    if (!invitationId) {
      res.status(400).json({ error: "Parameter invitationId wajib disertakan" });
      return;
    }
    if (KNOWN_DEMO_SLUGS.includes(invitationId)) {
      res.json({
        wishes: INITIAL_DEMO_WISHES,
        nextCursor: null
      });
      return;
    }
    const invitation = await getInvitationMeta(invitationId);
    if (!invitation) {
      res.json({ wishes: [], nextCursor: null });
      return;
    }
    const wishes = await prisma_default.wish.findMany({
      where: {
        invitationId: invitation.id,
        isHidden: false
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : void 0,
      skip: cursor ? 1 : 0,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        senderName: true,
        message: true,
        reaction: true,
        createdAt: true
      }
    });
    let nextCursor = null;
    if (wishes.length > limit) {
      const nextItem = wishes.pop();
      nextCursor = nextItem?.id || null;
    }
    res.json({ wishes, nextCursor });
  } catch (error) {
    next(error);
  }
}
async function submitWish(req, res, next) {
  try {
    const parsed = wishSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi ucapan gagal",
        details: parsed.error.format()
      });
      return;
    }
    const { invitationId, senderName, message, reaction } = parsed.data;
    const cleanSenderName = stripHtml(senderName);
    const cleanMessage = stripHtml(message);
    if (KNOWN_DEMO_SLUGS.includes(invitationId)) {
      res.status(201).json({
        message: "Doa dan ucapan berhasil dikirim (Demo Mode)",
        data: {
          id: `demo-wish-${Date.now()}`,
          senderName: cleanSenderName,
          message: cleanMessage,
          reaction: reaction || null,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      return;
    }
    const invitation = await getInvitationMeta(invitationId);
    if (!invitation || !invitation.isActive) {
      res.status(404).json({
        error: "Undangan tidak ditemukan atau sedang dinonaktifkan oleh pemilik"
      });
      return;
    }
    const wish = await prisma_default.wish.create({
      data: {
        invitationId: invitation.id,
        senderName: cleanSenderName,
        message: cleanMessage,
        reaction: reaction || null
      },
      select: {
        id: true,
        senderName: true,
        message: true,
        reaction: true,
        createdAt: true
      }
    });
    invalidateInvitationCache(invitationId, invitation.id);
    res.status(201).json({
      message: "Doa dan ucapan berhasil dikirim",
      data: wish
    });
  } catch (error) {
    next(error);
  }
}
async function getPublicSystemSettings(_req, res, next) {
  try {
    const settings = await getPublicSettingsMap();
    res.json({
      success: true,
      data: settings,
      ...settings
    });
  } catch (error) {
    next(error);
  }
}
async function downloadPublicFile(req, res, next) {
  try {
    const rawUrl = req.query.url;
    const requestedName = req.query.filename || "downloaded-file";
    if (!rawUrl || typeof rawUrl !== "string") {
      res.status(400).json({ error: "Parameter url wajib disertakan" });
      return;
    }
    const cleanFilename = requestedName.replace(/[^\w\s.-]/g, "").trim().replace(/\s+/g, "_") || "qris-download.jpg";
    if (rawUrl.startsWith("/uploads/")) {
      const safeRelative = path.normalize(rawUrl.replace(/^\/uploads\//, "")).replace(/^(\.\.[\/\\])+/, "");
      const fullPath = path.join(process.cwd(), "public", "uploads", safeRelative);
      if (fs.existsSync(fullPath)) {
        res.download(fullPath, cleanFilename);
        return;
      }
    }
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      const remoteRes = await fetch(rawUrl);
      if (!remoteRes.ok) {
        res.status(remoteRes.status).json({ error: "Gagal mengambil berkas dari tautan luar" });
        return;
      }
      const contentType = remoteRes.headers.get("content-type") || "application/octet-stream";
      res.setHeader("Content-Disposition", `attachment; filename="${cleanFilename}"`);
      res.setHeader("Content-Type", contentType);
      const arrayBuffer = await remoteRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
      return;
    }
    res.status(400).json({ error: "Format URL tidak didukung" });
  } catch (error) {
    next(error);
  }
}
var DUMMY_NAME_PATTERNS = /* @__PURE__ */ new Set([
  "pria",
  "wanita",
  "test",
  "test1",
  "test2",
  "pasangan baru",
  "nama pengantin",
  "nama mempelai",
  "dummy",
  "sample"
]);
var DUMMY_VENUE_PATTERNS = /* @__PURE__ */ new Set([
  "lokasi pernikahan",
  "nama tempat & kota",
  "nama tempat",
  "venue",
  "lokasi acara",
  "gedung serbaguna",
  "alamat venue"
]);
function extractValidShowcaseItem(inv, now) {
  if (!inv.eventSchedules || inv.eventSchedules.length === 0) {
    return null;
  }
  const latestScheduleTime = Math.max(
    ...inv.eventSchedules.map((s) => new Date(s.date).getTime())
  );
  if (latestScheduleTime > now.getTime()) {
    return null;
  }
  const primarySchedule = inv.eventSchedules[0];
  const venueTrimmed = (primarySchedule.venueName || "").trim().toLowerCase();
  if (!venueTrimmed || venueTrimmed.length < 3 || DUMMY_VENUE_PATTERNS.has(venueTrimmed)) {
    return null;
  }
  const info = inv.coupleInfo || {};
  const groomNick = (info.groomNickname || "").trim();
  const brideNick = (info.brideNickname || "").trim();
  if (!groomNick || !brideNick) {
    return null;
  }
  const groomLower = groomNick.toLowerCase();
  const brideLower = brideNick.toLowerCase();
  if (DUMMY_NAME_PATTERNS.has(groomLower) || DUMMY_NAME_PATTERNS.has(brideLower) || groomLower === brideLower) {
    return null;
  }
  const galleryImg = inv.galleries[0]?.imageUrl?.trim() || "";
  const photoCandidate = galleryImg || (typeof info.groomPhoto === "string" ? info.groomPhoto.trim() : "") || (typeof info.bridePhoto === "string" ? info.bridePhoto.trim() : "") || (typeof info.desktopCoverImage === "string" ? info.desktopCoverImage.trim() : "");
  if (!photoCandidate || photoCandidate.includes("couple-center.jpg") || photoCandidate.startsWith("/templates/")) {
    return null;
  }
  const hasCheckedIn = inv.guests.some((g) => g.checkedInAt !== null);
  const hasWishes = (inv._count?.wishes || 0) > 0;
  const hasRsvps = (inv._count?.rsvps || 0) > 0;
  if (!hasCheckedIn && !hasWishes && !hasRsvps) {
    return null;
  }
  const dateStr = new Date(primarySchedule.date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  return {
    couple: `${groomNick} & ${brideNick}`,
    date: dateStr,
    venue: primarySchedule.venueName.trim(),
    theme: inv.themeId || "Botanical",
    img: photoCandidate,
    slug: inv.slug
  };
}
async function getPublicShowcase(_req, res, next) {
  try {
    const now = /* @__PURE__ */ new Date();
    const candidates = await prisma_default.invitation.findMany({
      where: {
        isActive: true,
        NOT: {
          slug: {
            startsWith: "demo-"
          }
        },
        eventSchedules: {
          some: {
            date: { lte: now }
          }
        },
        OR: [
          { guests: { some: { checkedInAt: { not: null } } } },
          { wishes: { some: {} } },
          { rsvps: { some: {} } }
        ]
      },
      take: 24,
      orderBy: { createdAt: "desc" },
      include: {
        eventSchedules: { orderBy: { date: "asc" } },
        galleries: { take: 1, orderBy: { sortOrder: "asc" } },
        guests: {
          where: { checkedInAt: { not: null } },
          take: 1,
          select: { id: true, checkedInAt: true }
        },
        _count: {
          select: {
            wishes: true,
            rsvps: true
          }
        }
      }
    });
    const items = [];
    for (const inv of candidates) {
      const validItem = extractValidShowcaseItem(inv, now);
      if (validItem) {
        items.push(validItem);
        if (items.length >= 12) break;
      }
    }
    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
}
async function getPublicTestimonials(_req, res, next) {
  try {
    const setting = await prisma_default.systemSetting.findUnique({
      where: { key: "user_testimonials_json" }
    });
    let list = [];
    if (setting?.value) {
      try {
        list = JSON.parse(setting.value);
      } catch {
        list = [];
      }
    }
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    next(error);
  }
}
async function getPublicThemeStats(_req, res, next) {
  try {
    const now = /* @__PURE__ */ new Date();
    const maturedInvitations = await prisma_default.invitation.findMany({
      where: {
        isActive: true,
        eventSchedules: {
          some: {
            date: { lte: now }
          }
        }
      },
      select: {
        themeId: true
      }
    });
    const usageCounts = {};
    for (const inv of maturedInvitations) {
      if (inv.themeId) {
        usageCounts[inv.themeId] = (usageCounts[inv.themeId] || 0) + 1;
      }
    }
    res.json({
      success: true,
      data: usageCounts
    });
  } catch (error) {
    next(error);
  }
}
async function getPublicThemes(_req, res, next) {
  try {
    let sanityThemes = await getSanityThemes();
    if (!sanityThemes || sanityThemes.length === 0) {
      sanityThemes = await seedDefaultThemesToSanity();
    }
    if (sanityThemes && sanityThemes.length > 0) {
      const activeThemes = sanityThemes.filter((t) => t.isActive);
      res.json({
        success: true,
        data: activeThemes.map((t) => ({
          id: t.themeKey,
          themeKey: t.themeKey,
          name: t.name,
          category: t.category,
          thumbnail: t.thumbnail,
          previewUrl: t.previewUrl || `/invitation/demo-${t.themeKey}`,
          isPremium: t.isPremium,
          features: t.features,
          designConfig: t.designConfig,
          source: "sanity_cms"
        }))
      });
      return;
    }
    const fallbackThemes = await prisma_default.themeCatalog.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" }
    });
    res.json({
      success: true,
      data: fallbackThemes.map((t) => ({
        id: t.themeKey,
        themeKey: t.themeKey,
        name: t.name,
        category: t.category,
        thumbnail: t.thumbnail,
        previewUrl: t.previewUrl,
        isPremium: t.isPremium,
        source: "local_db"
      }))
    });
  } catch (error) {
    next(error);
  }
}

// server/routes/public.routes.ts
var router3 = Router3();
router3.get("/themes", rateLimitMiddleware("get_themes", 60, 60), getPublicThemes);
router3.get("/invitations/:slug", getPublicInvitation);
router3.post("/invitations/:slug/visit", rateLimitMiddleware("record_visit", 30, 60), recordPublicInvitationVisit);
router3.post("/invitations/:slug/heartbeat", handleVisitorHeartbeat);
router3.post("/invitations/:slug/leave", handleVisitorLeave);
router3.get("/invitations/:slug/live", getLiveVisitors);
router3.post("/rsvp", rateLimitMiddleware("submit_rsvp", 10, 300), submitRsvp);
router3.get("/wishes", rateLimitMiddleware("get_wishes", 60, 60), getWishes);
router3.post("/wishes", rateLimitMiddleware("submit_wish", 5, 60), submitWish);
router3.get("/settings", getPublicSystemSettings);
router3.get("/download-file", rateLimitMiddleware("download_file", 60, 60), downloadPublicFile);
router3.get("/showcase", rateLimitMiddleware("get_showcase", 60, 60), getPublicShowcase);
router3.get("/testimonials", rateLimitMiddleware("get_testimonials", 60, 60), getPublicTestimonials);
router3.get("/theme-stats", rateLimitMiddleware("get_theme_stats", 60, 60), getPublicThemeStats);
var public_routes_default = router3;

// server/routes/dashboard.routes.ts
import { Router as Router4 } from "express";

// server/controllers/dashboard.controller.ts
function generateSlugCode(name) {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 30);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${clean}-${randomSuffix}`;
}
async function getDashboardInvitation(req, res, next) {
  try {
    const user = req.user;
    let invitation = await prisma_default.invitation.findFirst({
      where: { userId: user.userId },
      include: {
        eventSchedules: { orderBy: { date: "asc" } },
        galleries: { orderBy: { sortOrder: "asc" } },
        bankAccounts: true,
        paymentTransactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { tier: true, paymentStatus: true, amount: true, orderId: true }
        }
      }
    });
    if (!invitation) {
      invitation = await prisma_default.invitation.create({
        data: {
          slug: `undangan-${user.userId.slice(-6)}`,
          title: "Pernikahan Mempelai",
          userId: user.userId,
          themeId: "botanical",
          isActive: true,
          coupleInfo: {
            groomName: "Mempelai Pria",
            groomNickname: "Pria",
            groomFather: "",
            groomMother: "",
            groomInstagram: "",
            groomPhoto: "",
            brideName: "Mempelai Wanita",
            brideNickname: "Wanita",
            brideFather: "",
            brideMother: "",
            brideInstagram: "",
            bridePhoto: "",
            greetingMessage: "Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Anda untuk menghadiri pernikahan kami.",
            stories: [],
            selectedTier: null
          }
        },
        include: {
          eventSchedules: true,
          galleries: true,
          bankAccounts: true,
          paymentTransactions: true
        }
      });
    }
    let settlementTx = invitation.paymentTransactions.find(
      (t) => t.paymentStatus === "SETTLEMENT"
    );
    if (!settlementTx) {
      const userSettlement = await prisma_default.paymentTransaction.findFirst({
        where: { userId: user.userId, paymentStatus: "SETTLEMENT" },
        orderBy: { createdAt: "desc" }
      });
      if (userSettlement) {
        settlementTx = {
          tier: userSettlement.tier,
          paymentStatus: userSettlement.paymentStatus,
          amount: userSettlement.amount,
          orderId: userSettlement.orderId
        };
        if (!userSettlement.invitationId) {
          await prisma_default.paymentTransaction.update({
            where: { id: userSettlement.id },
            data: { invitationId: invitation.id }
          });
        }
      }
    }
    const waitingTx = invitation.paymentTransactions.find(
      (t) => t.paymentStatus === "WAITING_VERIFICATION"
    );
    const pendingTx = invitation.paymentTransactions.find(
      (t) => t.paymentStatus === "PENDING"
    );
    const coupleInfo = invitation.coupleInfo || {};
    const selectedTier = coupleInfo.selectedTier || null;
    const isAdmin = user.role === "ADMIN" || user.email === "admin@admin.com";
    const hasActiveSubscription = isAdmin || Boolean(settlementTx) || Boolean(invitation.activeUntil) && new Date(invitation.activeUntil) > /* @__PURE__ */ new Date();
    if (!isAdmin && !hasActiveSubscription) {
      res.status(403).json({
        error: "NO_ACTIVE_PACKAGE",
        message: "Akun Anda belum memiliki paket undangan aktif. Silakan beli paket terlebih dahulu."
      });
      return;
    }
    let currentTier = null;
    let isPaid = false;
    let paymentStatus = "UNSELECTED";
    if (isAdmin) {
      currentTier = settlementTx?.tier || selectedTier || "ULTIMATE";
      isPaid = true;
      paymentStatus = "SETTLEMENT";
    } else if (settlementTx) {
      currentTier = settlementTx.tier;
      isPaid = true;
      paymentStatus = "SETTLEMENT";
    } else if (invitation.activeUntil && new Date(invitation.activeUntil) > /* @__PURE__ */ new Date()) {
      currentTier = waitingTx?.tier || selectedTier || "ELEGANT";
      isPaid = true;
      paymentStatus = "SETTLEMENT";
    } else if (waitingTx) {
      currentTier = waitingTx.tier;
      isPaid = false;
      paymentStatus = "WAITING_VERIFICATION";
    } else if (pendingTx) {
      currentTier = pendingTx.tier;
      isPaid = false;
      paymentStatus = "PENDING";
    } else if (selectedTier) {
      currentTier = selectedTier;
      isPaid = false;
      paymentStatus = "UNPAID";
    } else {
      currentTier = null;
      isPaid = false;
      paymentStatus = "UNSELECTED";
    }
    const effectiveActiveUntil = isPaid ? invitation.activeUntil : null;
    const musicUrl = coupleInfo.musicUrl || null;
    const youtubeVideoUrl = coupleInfo.youtubeVideoUrl || null;
    const analytics = await getInvitationAnalytics(invitation.id);
    res.json({
      success: true,
      data: {
        ...invitation,
        musicUrl,
        youtubeVideoUrl,
        activeUntil: effectiveActiveUntil,
        tier: currentTier,
        isPaid,
        paymentStatus,
        userEmail: user.email,
        isAdmin: user.role === "ADMIN" || user.email === "admin@admin.com",
        analytics
      }
    });
  } catch (error) {
    next(error);
  }
}
async function updateDashboardInvitation(req, res, next) {
  try {
    const user = req.user;
    const body = req.body;
    const normalizedBody = {
      ...body,
      schedules: body.schedules || body.eventSchedules || []
    };
    const parseResult = invitationSchema.safeParse(normalizedBody);
    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors;
      const errorList = [];
      for (const [field, msgs] of Object.entries(fieldErrors)) {
        if (msgs && msgs.length > 0) {
          errorList.push(`${field}: ${msgs.join(", ")}`);
        }
      }
      res.status(400).json({
        success: false,
        error: errorList.length > 0 ? `Validasi gagal pada: ${errorList.join("; ")}` : "Validasi data gagal",
        details: parseResult.error.flatten()
      });
      return;
    }
    const validData = parseResult.data;
    const userInv = await prisma_default.invitation.findFirst({
      where: { userId: user.userId },
      include: {
        paymentTransactions: {
          where: { paymentStatus: "SETTLEMENT" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { tier: true }
        }
      }
    });
    if (!userInv) {
      res.status(404).json({ success: false, error: "Undangan tidak ditemukan" });
      return;
    }
    const hasActiveSettlement = userInv.paymentTransactions && userInv.paymentTransactions.length > 0;
    const isAdmin = user.role === "ADMIN" || user.email === "admin@admin.com";
    if (!hasActiveSettlement && !isAdmin) {
      res.status(403).json({
        success: false,
        error: "Akun Anda belum memiliki paket aktif. Silakan pilih dan aktifkan paket di menu Langganan & Paket untuk mulai mengedit dan menyimpan undangan."
      });
      return;
    }
    const currentTier = userInv.paymentTransactions?.[0]?.tier || "STARTER";
    if (currentTier === "STARTER" && !isAdmin) {
      const gNick = (validData.coupleInfo?.groomNickname || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const bNick = (validData.coupleInfo?.brideNickname || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      if (gNick && bNick) {
        validData.slug = `${gNick}-${bNick}`;
      }
    }
    const existingSlug = await prisma_default.invitation.findFirst({
      where: {
        slug: validData.slug,
        userId: { not: user.userId }
      }
    });
    if (existingSlug) {
      res.status(409).json({
        success: false,
        error: "Subdomain / slug tautan ini sudah dipakai pasangan lain."
      });
      return;
    }
    if (currentTier === "STARTER" && !isAdmin) {
      if (validData.galleries && validData.galleries.length > 10) {
        res.status(400).json({
          success: false,
          error: "Paket Starter mengizinkan maksimal 10 foto galeri. Silakan upgrade ke Paket Elegant untuk foto tanpa batas."
        });
        return;
      }
      if (validData.bankAccounts && validData.bankAccounts.length > 2) {
        res.status(400).json({
          success: false,
          error: "Paket Starter mengizinkan maksimal 2 rekening bank. Silakan upgrade ke Paket Elegant untuk rekening tanpa batas."
        });
        return;
      }
      if (validData.bankAccounts && validData.bankAccounts.some((b) => b.qrisImageUrl && b.qrisImageUrl.trim() !== "")) {
        res.status(400).json({
          success: false,
          error: "Paket Starter tidak mendukung foto QRIS. Silakan upgrade ke Paket Elegant atau Ultimate untuk menggunakan scan QRIS."
        });
        return;
      }
      if (validData.coupleInfo?.stories && validData.coupleInfo.stories.some((s) => s.imageUrl && s.imageUrl.trim() !== "")) {
        res.status(400).json({
          success: false,
          error: "Paket Starter tidak mendukung upload foto pada Kisah Cinta. Silakan upgrade ke Paket Elegant atau Ultimate untuk menambahkan foto momen cinta."
        });
        return;
      }
      if (validData.themeId && validData.themeId !== "botanical") {
        res.status(400).json({
          success: false,
          error: "Paket Starter saat ini menggunakan tema Botanical Tema 01."
        });
        return;
      }
    }
    const coupleInfoData = {
      ...validData.coupleInfo,
      musicUrl: validData.musicUrl || validData.coupleInfo.musicUrl || null,
      youtubeVideoUrl: validData.youtubeVideoUrl || validData.coupleInfo.youtubeVideoUrl || null
    };
    const updated = await prisma_default.$transaction(async (tx) => {
      const inv = await tx.invitation.update({
        where: { id: userInv.id },
        data: {
          title: validData.title,
          slug: validData.slug,
          themeId: validData.themeId,
          coupleInfo: coupleInfoData,
          isActive: validData.isActive,
          ...validData.activeUntil ? { activeUntil: new Date(validData.activeUntil) } : {}
        }
      });
      await tx.eventSchedule.deleteMany({ where: { invitationId: userInv.id } });
      if (validData.schedules && validData.schedules.length > 0) {
        await tx.eventSchedule.createMany({
          data: validData.schedules.map((s) => ({
            invitationId: userInv.id,
            eventName: s.eventName,
            date: new Date(s.date),
            startTime: s.startTime,
            endTime: s.endTime || null,
            venueName: s.venueName,
            address: s.address,
            mapsUrl: s.mapsUrl || null,
            latitude: s.latitude || null,
            longitude: s.longitude || null
          }))
        });
      }
      await tx.gallery.deleteMany({ where: { invitationId: userInv.id } });
      if (validData.galleries && validData.galleries.length > 0) {
        await tx.gallery.createMany({
          data: validData.galleries.map((g, idx) => ({
            invitationId: userInv.id,
            imageUrl: g.imageUrl,
            caption: g.caption || null,
            sortOrder: g.sortOrder !== void 0 ? g.sortOrder : idx
          }))
        });
      }
      await tx.bankAccount.deleteMany({ where: { invitationId: userInv.id } });
      if (validData.bankAccounts && validData.bankAccounts.length > 0) {
        await tx.bankAccount.createMany({
          data: validData.bankAccounts.map((b) => ({
            invitationId: userInv.id,
            bankName: b.bankName,
            accountNumber: b.accountNumber,
            accountHolder: b.accountHolder,
            qrisImageUrl: currentTier === "STARTER" && !isAdmin ? null : b.qrisImageUrl || null
          }))
        });
      }
      return inv;
    });
    invalidateInvitationCache(updated.slug, updated.id);
    if (userInv.slug !== updated.slug) {
      invalidateInvitationCache(userInv.slug, userInv.id);
    }
    void syncInvitationToSanity({
      id: updated.id,
      slug: updated.slug,
      title: validData.title,
      themeId: validData.themeId,
      isActive: validData.isActive,
      activeUntil: validData.activeUntil,
      coupleInfo: coupleInfoData,
      eventSchedules: validData.schedules,
      galleries: validData.galleries,
      bankAccounts: validData.bankAccounts
    }).catch((err) => {
      console.error("[Dashboard] Sanity sync background error:", err);
    });
    res.json({
      success: true,
      message: "Data undangan berhasil disimpan",
      data: updated
    });
  } catch (error) {
    next(error);
  }
}
async function patchDashboardInvitation(req, res, next) {
  try {
    const user = req.user;
    const body = req.body;
    const userInv = await prisma_default.invitation.findFirst({
      where: { userId: user.userId },
      include: {
        paymentTransactions: {
          where: { paymentStatus: "SETTLEMENT" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { tier: true }
        }
      }
    });
    if (!userInv) {
      res.status(404).json({ success: false, error: "Undangan tidak ditemukan" });
      return;
    }
    const currentTier = userInv.paymentTransactions?.[0]?.tier || "FREE";
    const updateData = {};
    if (body.selectedTier && ["STARTER", "ELEGANT", "ULTIMATE"].includes(body.selectedTier)) {
      const currentCouple = userInv.coupleInfo || {};
      updateData.coupleInfo = {
        ...currentCouple,
        selectedTier: body.selectedTier
      };
    }
    if (body.themeId && typeof body.themeId === "string") {
      if (currentTier === "FREE" && body.themeId !== "botanical") {
        res.status(400).json({
          success: false,
          error: "Tema ini khusus untuk paket berbayar. Silakan upgrade paket Anda untuk menggunakan tema ini."
        });
        return;
      }
      updateData.themeId = body.themeId;
    }
    if (body.isActive !== void 0) {
      updateData.isActive = Boolean(body.isActive);
    }
    if (body.title && typeof body.title === "string") {
      updateData.title = body.title.trim();
    }
    if (body.slug && typeof body.slug === "string") {
      const cleanSlug = body.slug.toLowerCase().trim();
      const existingSlug = await prisma_default.invitation.findFirst({
        where: {
          slug: cleanSlug,
          userId: { not: user.userId }
        }
      });
      if (existingSlug) {
        res.status(409).json({
          success: false,
          error: "Subdomain tautan sudah digunakan pasangan lain"
        });
        return;
      }
      updateData.slug = cleanSlug;
    }
    const updated = await prisma_default.invitation.update({
      where: { id: userInv.id },
      data: updateData
    });
    invalidateInvitationCache(updated.slug, updated.id);
    if (userInv.slug !== updated.slug) {
      invalidateInvitationCache(userInv.slug, userInv.id);
    }
    void prisma_default.invitation.findUnique({
      where: { id: updated.id },
      include: { eventSchedules: true, galleries: true, bankAccounts: true }
    }).then((fullInv) => {
      if (fullInv) {
        return syncInvitationToSanity({
          id: fullInv.id,
          slug: fullInv.slug,
          title: fullInv.title,
          themeId: fullInv.themeId,
          isActive: fullInv.isActive,
          activeUntil: fullInv.activeUntil,
          coupleInfo: fullInv.coupleInfo || {},
          eventSchedules: fullInv.eventSchedules,
          galleries: fullInv.galleries,
          bankAccounts: fullInv.bankAccounts
        });
      }
    }).catch((err) => {
      console.error("[DashboardPatch] Sanity sync background error:", err);
    });
    res.json({
      success: true,
      message: "Pengaturan berhasil diperbarui",
      data: updated
    });
  } catch (error) {
    next(error);
  }
}
async function getGuests(req, res, next) {
  try {
    const user = req.user;
    const invitation = await prisma_default.invitation.findFirst({
      where: { userId: user.userId },
      select: { id: true, slug: true }
    });
    if (!invitation) {
      res.json({ success: true, data: { guests: [], invitationSlug: "" } });
      return;
    }
    const guests = await prisma_default.guest.findMany({
      where: { invitationId: invitation.id },
      orderBy: { name: "asc" }
    });
    res.json({
      success: true,
      data: {
        guests,
        invitationSlug: invitation.slug
      }
    });
  } catch (error) {
    next(error);
  }
}
async function addGuest(req, res, next) {
  try {
    const user = req.user;
    const invitation = await prisma_default.invitation.findFirst({
      where: { userId: user.userId },
      select: { id: true }
    });
    if (!invitation) {
      res.status(400).json({
        success: false,
        error: "Silakan buat draft undangan terlebih dahulu"
      });
      return;
    }
    const { guests, name, phoneNumber, quota } = req.body;
    if (name && typeof name === "string") {
      const newGuest = await prisma_default.guest.create({
        data: {
          invitationId: invitation.id,
          name: name.trim(),
          slugCode: generateSlugCode(name),
          phoneNumber: phoneNumber ? String(phoneNumber).trim() : null,
          quota: quota ? Number(quota) : 1
        }
      });
      res.json({
        success: true,
        message: "Tamu berhasil ditambahkan",
        data: newGuest
      });
      return;
    }
    if (Array.isArray(guests) && guests.length > 0) {
      const created = await Promise.all(
        guests.map(async (g) => {
          if (!g.name) return null;
          return prisma_default.guest.create({
            data: {
              invitationId: invitation.id,
              name: String(g.name).trim(),
              slugCode: generateSlugCode(String(g.name)),
              phoneNumber: g.phoneNumber ? String(g.phoneNumber).trim() : null,
              quota: g.quota ? Number(g.quota) : 1
            }
          });
        })
      );
      const validCreated = created.filter(Boolean);
      res.json({
        success: true,
        message: `Berhasil menambahkan ${validCreated.length} tamu undangan`,
        data: validCreated
      });
      return;
    }
    res.status(400).json({ success: false, error: "Data tamu tidak valid" });
  } catch (error) {
    next(error);
  }
}
async function updateGuest(req, res, next) {
  try {
    const user = req.user;
    const { id, name, phoneNumber, quota } = req.body;
    if (!id || typeof id !== "string") {
      res.status(400).json({ success: false, error: "ID tamu wajib disertakan" });
      return;
    }
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ success: false, error: "Nama tamu wajib diisi" });
      return;
    }
    const guest = await prisma_default.guest.findUnique({
      where: { id },
      include: { invitation: { select: { userId: true } } }
    });
    if (!guest || guest.invitation.userId !== user.userId) {
      res.status(404).json({ success: false, error: "Tamu tidak ditemukan" });
      return;
    }
    const updated = await prisma_default.guest.update({
      where: { id },
      data: {
        name: name.trim(),
        phoneNumber: phoneNumber ? String(phoneNumber).trim() : null,
        quota: quota ? Math.max(1, Number(quota)) : 1
      }
    });
    res.json({
      success: true,
      message: "Data tamu berhasil diperbarui",
      data: updated
    });
  } catch (error) {
    next(error);
  }
}
async function deleteGuest(req, res, next) {
  try {
    const user = req.user;
    const id = req.query.id || req.body?.id;
    if (!id) {
      res.status(400).json({ success: false, error: "id tamu wajib disertakan" });
      return;
    }
    const guest = await prisma_default.guest.findUnique({
      where: { id },
      include: { invitation: { select: { userId: true } } }
    });
    if (!guest || guest.invitation.userId !== user.userId) {
      res.status(404).json({ success: false, error: "Tamu tidak ditemukan" });
      return;
    }
    await prisma_default.guest.delete({ where: { id } });
    res.json({ success: true, message: "Tamu berhasil dihapus" });
  } catch (error) {
    next(error);
  }
}
async function getRsvpRecap(req, res, next) {
  try {
    const user = req.user;
    const invitation = await prisma_default.invitation.findFirst({
      where: { userId: user.userId },
      select: { id: true }
    });
    if (!invitation) {
      res.json({
        success: true,
        data: {
          totalResponses: 0,
          attendingCount: 0,
          notAttendingCount: 0,
          tentativeCount: 0,
          totalPax: 0,
          rsvps: [],
          analytics: { totalViews: 0, todayViews: 0, mobilePercent: 100 }
        }
      });
      return;
    }
    const rsvps = await prisma_default.rsvp.findMany({
      where: { invitationId: invitation.id },
      orderBy: { createdAt: "desc" }
    });
    let attendingCount = 0;
    let notAttendingCount = 0;
    let tentativeCount = 0;
    let totalPax = 0;
    for (const r of rsvps) {
      if (r.status === "ATTENDING") {
        attendingCount += 1;
        totalPax += r.attendeeCount || 1;
      } else if (r.status === "NOT_ATTENDING") {
        notAttendingCount += 1;
      } else {
        tentativeCount += 1;
      }
    }
    const analytics = await getInvitationAnalytics(invitation.id);
    res.json({
      success: true,
      data: {
        totalResponses: rsvps.length,
        attendingCount,
        notAttendingCount,
        tentativeCount,
        totalPax,
        rsvps,
        analytics
      }
    });
  } catch (error) {
    next(error);
  }
}
async function getDashboardPayments(req, res, next) {
  try {
    const user = req.user;
    const transactions = await prisma_default.paymentTransaction.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderId: true,
        tier: true,
        amount: true,
        paymentType: true,
        paymentStatus: true,
        proofImageUrl: true,
        verifiedAt: true,
        createdAt: true
      }
    });
    res.json({
      success: true,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        orderId: tx.orderId,
        tier: tx.tier,
        amount: Number(tx.amount),
        paymentType: tx.paymentType,
        paymentStatus: tx.paymentStatus,
        proofImageUrl: tx.proofImageUrl,
        verifiedAt: tx.verifiedAt,
        createdAt: tx.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
}
async function toggleGuestCheckin(req, res, next) {
  try {
    const user = req.user;
    const { id, action } = req.body;
    if (!id || typeof id !== "string") {
      res.status(400).json({ success: false, error: "ID tamu wajib disertakan" });
      return;
    }
    const guest = await prisma_default.guest.findUnique({
      where: { id },
      include: { invitation: { select: { userId: true, id: true } } }
    });
    if (!guest || guest.invitation.userId !== user.userId) {
      res.status(404).json({ success: false, error: "Tamu tidak ditemukan" });
      return;
    }
    let newCheckedInAt = null;
    if (action === "undo") {
      newCheckedInAt = null;
    } else if (action === "checkin") {
      newCheckedInAt = /* @__PURE__ */ new Date();
    } else {
      newCheckedInAt = guest.checkedInAt ? null : /* @__PURE__ */ new Date();
    }
    const updated = await prisma_default.guest.update({
      where: { id },
      data: { checkedInAt: newCheckedInAt }
    });
    res.json({
      success: true,
      message: updated.checkedInAt ? `Tamu "${updated.name}" (${updated.quota} Pax) berhasil check-in.` : `Check-in tamu "${updated.name}" berhasil dibatalkan.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}
async function scanGuestQr(req, res, next) {
  try {
    const user = req.user;
    const { qrData, guestId, slugCode } = req.body;
    const userInv = await prisma_default.invitation.findFirst({
      where: { userId: user.userId },
      select: { id: true, title: true, slug: true }
    });
    if (!userInv) {
      res.status(404).json({ success: false, error: "Undangan tidak ditemukan" });
      return;
    }
    let targetGuest = null;
    if (guestId) {
      targetGuest = await prisma_default.guest.findFirst({
        where: { id: guestId, invitationId: userInv.id }
      });
    } else if (slugCode) {
      targetGuest = await prisma_default.guest.findFirst({
        where: { slugCode, invitationId: userInv.id }
      });
    } else if (qrData && typeof qrData === "string") {
      const trimmed = qrData.trim();
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.guestId) {
          targetGuest = await prisma_default.guest.findFirst({
            where: { id: parsed.guestId, invitationId: userInv.id }
          });
        } else if (parsed.slugCode) {
          targetGuest = await prisma_default.guest.findFirst({
            where: { slugCode: parsed.slugCode, invitationId: userInv.id }
          });
        }
      } catch {
      }
      if (!targetGuest) {
        let extractedCodeOrName = trimmed;
        if (trimmed.includes("?")) {
          try {
            const urlObj = new URL(trimmed.startsWith("http") ? trimmed : `http://dummy.com/${trimmed}`);
            const codeParam = urlObj.searchParams.get("code") || urlObj.searchParams.get("slugCode");
            const toParam = urlObj.searchParams.get("to");
            if (codeParam) extractedCodeOrName = codeParam;
            else if (toParam) extractedCodeOrName = toParam;
          } catch {
          }
        }
        targetGuest = await prisma_default.guest.findFirst({
          where: {
            invitationId: userInv.id,
            OR: [
              { id: extractedCodeOrName },
              { slugCode: extractedCodeOrName },
              { name: { equals: extractedCodeOrName, mode: "insensitive" } }
            ]
          }
        });
      }
    }
    if (!targetGuest) {
      res.status(404).json({
        success: false,
        error: "Data tamu tidak ditemukan dalam daftar buku tamu acara ini."
      });
      return;
    }
    const isAlreadyCheckedIn = Boolean(targetGuest.checkedInAt);
    let updatedGuest = targetGuest;
    if (!isAlreadyCheckedIn) {
      updatedGuest = await prisma_default.guest.update({
        where: { id: targetGuest.id },
        data: { checkedInAt: /* @__PURE__ */ new Date() }
      });
    }
    const allGuests = await prisma_default.guest.findMany({
      where: { invitationId: userInv.id },
      select: { quota: true, checkedInAt: true }
    });
    const totalGuests = allGuests.length;
    const checkedInGuests = allGuests.filter((g) => g.checkedInAt).length;
    const totalPax = allGuests.reduce((acc, g) => acc + (g.quota || 1), 0);
    const checkedInPax = allGuests.filter((g) => g.checkedInAt).reduce((acc, g) => acc + (g.quota || 1), 0);
    res.json({
      success: true,
      status: isAlreadyCheckedIn ? "ALREADY_CHECKED_IN" : "CHECKIN_SUCCESS",
      message: isAlreadyCheckedIn ? `Tamu "${targetGuest.name}" SUDAH check-in sebelumnya pada ${new Date(
        targetGuest.checkedInAt
      ).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB.` : `Tamu "${targetGuest.name}" (${targetGuest.quota} Pax) berhasil check-in!`,
      data: {
        guest: updatedGuest,
        stats: {
          totalGuests,
          checkedInGuests,
          totalPax,
          checkedInPax
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
async function getGuestCheckinStats(req, res, next) {
  try {
    const user = req.user;
    const invitation = await prisma_default.invitation.findFirst({
      where: { userId: user.userId },
      select: { id: true }
    });
    if (!invitation) {
      res.json({
        success: true,
        data: {
          totalGuests: 0,
          checkedInGuests: 0,
          totalPax: 0,
          checkedInPax: 0,
          recentCheckins: []
        }
      });
      return;
    }
    const guests = await prisma_default.guest.findMany({
      where: { invitationId: invitation.id },
      orderBy: { checkedInAt: "desc" }
    });
    const totalGuests = guests.length;
    const checkedInList = guests.filter((g) => g.checkedInAt);
    const checkedInGuests = checkedInList.length;
    const totalPax = guests.reduce((acc, g) => acc + (g.quota || 1), 0);
    const checkedInPax = checkedInList.reduce((acc, g) => acc + (g.quota || 1), 0);
    const recentCheckins = checkedInList.slice(0, 10);
    res.json({
      success: true,
      data: {
        totalGuests,
        checkedInGuests,
        totalPax,
        checkedInPax,
        recentCheckins
      }
    });
  } catch (error) {
    next(error);
  }
}
async function getUserTestimonial(req, res, next) {
  try {
    const user = req.user;
    const setting = await prisma_default.systemSetting.findUnique({
      where: { key: "user_testimonials_json" }
    });
    let testimonials = [];
    if (setting?.value) {
      try {
        testimonials = JSON.parse(setting.value);
      } catch {
        testimonials = [];
      }
    }
    const myTestimonial = testimonials.find((t) => t.userId === user.userId) || null;
    res.json({
      success: true,
      data: myTestimonial
    });
  } catch (error) {
    next(error);
  }
}
async function submitUserTestimonial(req, res, next) {
  try {
    const user = req.user;
    const { couple, city, rating, comment, weddingDate } = req.body;
    if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
      res.status(400).json({ error: "Ulasan testimoni minimal 5 karakter" });
      return;
    }
    const numRating = Math.max(1, Math.min(5, Number(rating) || 5));
    const cleanCouple = typeof couple === "string" && couple.trim() ? couple.trim() : user.email.split("@")[0];
    const cleanCity = typeof city === "string" && city.trim() ? city.trim() : "Indonesia";
    const cleanWeddingDate = typeof weddingDate === "string" && weddingDate.trim() ? weddingDate.trim() : "2026";
    const setting = await prisma_default.systemSetting.findUnique({
      where: { key: "user_testimonials_json" }
    });
    let testimonials = [];
    if (setting?.value) {
      try {
        testimonials = JSON.parse(setting.value);
      } catch {
        testimonials = [];
      }
    }
    const existingIndex = testimonials.findIndex((t) => t.userId === user.userId);
    const updatedItem = {
      id: existingIndex >= 0 ? testimonials[existingIndex].id : `testi-${Date.now()}`,
      userId: user.userId,
      couple: cleanCouple,
      city: cleanCity,
      rating: numRating,
      comment: comment.trim(),
      weddingDate: cleanWeddingDate,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      createdAt: existingIndex >= 0 ? testimonials[existingIndex].createdAt : (/* @__PURE__ */ new Date()).toISOString()
    };
    if (existingIndex >= 0) {
      testimonials[existingIndex] = updatedItem;
    } else {
      testimonials.unshift(updatedItem);
    }
    await prisma_default.systemSetting.upsert({
      where: { key: "user_testimonials_json" },
      create: {
        key: "user_testimonials_json",
        value: JSON.stringify(testimonials),
        description: "Daftar ulasan & testimoni dari pasangan pengantin yang menggunakan Invity"
      },
      update: {
        value: JSON.stringify(testimonials)
      }
    });
    res.json({
      success: true,
      message: "Terima kasih! Testimoni pernikahan Anda berhasil disimpan.",
      data: updatedItem
    });
  } catch (error) {
    next(error);
  }
}
async function getReceptionAccess(req, res, next) {
  try {
    const user = req.user;
    const invitation = await prisma_default.invitation.findFirst({
      where: { userId: user.userId },
      select: { id: true, slug: true, title: true, coupleInfo: true }
    });
    if (!invitation) {
      res.status(404).json({ success: false, error: "Undangan tidak ditemukan" });
      return;
    }
    const coupleInfo = invitation.coupleInfo || {};
    let pin = String(coupleInfo.receptionPin || "").trim();
    if (!pin) {
      pin = Math.floor(1e5 + Math.random() * 9e5).toString();
      const updatedInfo = { ...coupleInfo, receptionPin: pin };
      await prisma_default.invitation.update({
        where: { id: invitation.id },
        data: { coupleInfo: updatedInfo }
      });
    }
    res.json({
      success: true,
      data: {
        slug: invitation.slug,
        title: invitation.title,
        pin,
        receptionPath: `/reception/${invitation.slug}`,
        directAccessPath: `/reception/${invitation.slug}?pin=${pin}`
      }
    });
  } catch (error) {
    next(error);
  }
}
async function updateReceptionPin(req, res, next) {
  try {
    const user = req.user;
    const { pin } = req.body;
    if (!pin || typeof pin !== "string" || pin.trim().length < 4 || pin.trim().length > 12) {
      res.status(400).json({
        success: false,
        error: "PIN Meja Tamu harus terdiri dari 4 sampai 12 karakter."
      });
      return;
    }
    const cleanPin = pin.trim();
    const invitation = await prisma_default.invitation.findFirst({
      where: { userId: user.userId },
      select: { id: true, coupleInfo: true }
    });
    if (!invitation) {
      res.status(404).json({ success: false, error: "Undangan tidak ditemukan" });
      return;
    }
    const coupleInfo = invitation.coupleInfo || {};
    const updatedInfo = { ...coupleInfo, receptionPin: cleanPin };
    await prisma_default.invitation.update({
      where: { id: invitation.id },
      data: { coupleInfo: updatedInfo }
    });
    res.json({
      success: true,
      message: "PIN Meja Tamu Pagar Ayu berhasil diperbarui.",
      data: { pin: cleanPin }
    });
  } catch (error) {
    next(error);
  }
}

// server/routes/dashboard.routes.ts
var router4 = Router4();
router4.use(authMiddleware);
router4.get("/invitation", getDashboardInvitation);
router4.put("/invitation", updateDashboardInvitation);
router4.patch("/invitation", patchDashboardInvitation);
router4.get("/guests", getGuests);
router4.post("/guests", addGuest);
router4.put("/guests", updateGuest);
router4.delete("/guests", deleteGuest);
router4.post("/guests/checkin", toggleGuestCheckin);
router4.post("/guests/scan", scanGuestQr);
router4.get("/guests/checkin-stats", getGuestCheckinStats);
router4.get("/reception-access", getReceptionAccess);
router4.post("/reception-pin", updateReceptionPin);
router4.get("/rsvp-recap", getRsvpRecap);
router4.get("/payments", getDashboardPayments);
router4.get("/testimonial", getUserTestimonial);
router4.post("/testimonial", submitUserTestimonial);
var dashboard_routes_default = router4;

// server/routes/admin.routes.ts
import { Router as Router5 } from "express";

// server/controllers/admin.controller.ts
import fs2 from "fs/promises";
import path2 from "path";
import { UserRole as UserRole2, SubscriptionTier, PaymentType } from "@prisma/client";
import { z as z2 } from "zod";
async function getMetrics(_req, res, next) {
  try {
    const now = /* @__PURE__ */ new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [
      totalUsers,
      totalActiveInvitations,
      pendingPaymentsCount,
      monthlySettlements,
      recentUsers
    ] = await Promise.all([
      prisma_default.user.count(),
      prisma_default.invitation.count({ where: { isActive: true } }),
      prisma_default.paymentTransaction.count({ where: { paymentStatus: "WAITING_VERIFICATION" } }),
      prisma_default.paymentTransaction.findMany({
        where: {
          paymentStatus: "SETTLEMENT",
          createdAt: { gte: startOfMonth }
        },
        select: { amount: true }
      }),
      prisma_default.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          invitations: {
            take: 1,
            select: { title: true, slug: true, isActive: true }
          }
        }
      })
    ]);
    const monthlyRevenue = monthlySettlements.reduce(
      (acc, curr) => acc + Number(curr.amount || 0),
      0
    );
    res.json({
      success: true,
      data: {
        totalUsers,
        totalActiveInvitations,
        pendingPaymentsCount,
        monthlyRevenue,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
}
async function getClients(_req, res, next) {
  try {
    const users = await prisma_default.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        invitations: {
          select: {
            id: true,
            title: true,
            slug: true,
            themeId: true,
            activeUntil: true,
            isActive: true,
            coupleInfo: true,
            paymentTransactions: {
              orderBy: { createdAt: "desc" },
              take: 10,
              select: { tier: true, paymentStatus: true }
            }
          }
        }
      }
    });
    const clients = users.map((u) => {
      const inv = u.invitations[0] || null;
      const coupleInfo = inv?.coupleInfo || {};
      const settlementTx = inv?.paymentTransactions.find((t) => t.paymentStatus === "SETTLEMENT");
      const pendingTx = inv?.paymentTransactions[0];
      const selectedTier = coupleInfo.selectedTier || null;
      let latestTier = "BELUM_PILIH_PAKET";
      if (settlementTx) {
        latestTier = settlementTx.tier;
      } else if (pendingTx) {
        latestTier = pendingTx.tier;
      } else if (selectedTier) {
        latestTier = selectedTier;
      }
      let status = "NO_INVITATION";
      if (inv) {
        if (!inv.isActive) {
          status = "INACTIVE";
        } else if (inv.activeUntil && new Date(inv.activeUntil) < /* @__PURE__ */ new Date()) {
          status = "EXPIRED";
        } else {
          status = "ACTIVE";
        }
      }
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        invitation: inv ? {
          id: inv.id,
          title: inv.title,
          slug: inv.slug,
          themeId: inv.themeId,
          activeUntil: inv.activeUntil,
          isActive: inv.isActive,
          tier: latestTier,
          status
        } : null
      };
    });
    res.json({ success: true, data: clients });
  } catch (error) {
    next(error);
  }
}
async function patchClient(req, res, next) {
  try {
    const {
      userId,
      invitationId,
      addDays,
      isActive,
      tier,
      isLifetime,
      customExpireDate
    } = req.body;
    if (!invitationId && !userId) {
      res.status(400).json({ success: false, error: "invitationId atau userId wajib disertakan" });
      return;
    }
    const VALID_SUBSCRIPTION_TIERS = [
      SubscriptionTier.FREE,
      SubscriptionTier.STARTER,
      SubscriptionTier.ELEGANT,
      SubscriptionTier.ULTIMATE
    ];
    let targetInv = null;
    if (invitationId) {
      targetInv = await prisma_default.invitation.findUnique({
        where: { id: invitationId },
        select: {
          id: true,
          userId: true,
          activeUntil: true,
          isActive: true,
          coupleInfo: true
        }
      });
    }
    if (!targetInv && userId) {
      targetInv = await prisma_default.invitation.findFirst({
        where: { userId },
        select: {
          id: true,
          userId: true,
          activeUntil: true,
          isActive: true,
          coupleInfo: true
        }
      });
    }
    if (!targetInv && userId) {
      const user = await prisma_default.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ success: false, error: "User tidak ditemukan" });
        return;
      }
      const initialTier = tier && VALID_SUBSCRIPTION_TIERS.includes(tier) ? tier : SubscriptionTier.ELEGANT;
      const slug = `undangan-${Math.random().toString(36).substring(2, 8)}`;
      targetInv = await prisma_default.invitation.create({
        data: {
          userId: user.id,
          slug,
          title: `Undangan ${user.name}`,
          themeId: "minimalist-chic",
          isActive: true,
          coupleInfo: {
            groomName: "Mempelai Pria",
            brideName: "Mempelai Wanita",
            selectedTier: initialTier
          },
          activeUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3)
        },
        select: {
          id: true,
          userId: true,
          activeUntil: true,
          isActive: true,
          coupleInfo: true
        }
      });
    }
    if (!targetInv) {
      res.status(404).json({ success: false, error: "Undangan tidak ditemukan" });
      return;
    }
    const updateData = {};
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }
    if (isLifetime || addDays === 36500) {
      const lifetimeDate = /* @__PURE__ */ new Date();
      lifetimeDate.setFullYear(lifetimeDate.getFullYear() + 100);
      updateData.activeUntil = lifetimeDate;
    } else if (customExpireDate) {
      const parsedDate = new Date(customExpireDate);
      if (!isNaN(parsedDate.getTime())) {
        updateData.activeUntil = parsedDate;
      }
    } else if (typeof addDays === "number" && addDays > 0) {
      const baseDate = targetInv.activeUntil && targetInv.activeUntil > /* @__PURE__ */ new Date() ? new Date(targetInv.activeUntil) : /* @__PURE__ */ new Date();
      baseDate.setDate(baseDate.getDate() + addDays);
      updateData.activeUntil = baseDate;
    }
    const currentCoupleInfo = typeof targetInv.coupleInfo === "object" && targetInv.coupleInfo !== null && !Array.isArray(targetInv.coupleInfo) ? { ...targetInv.coupleInfo } : {};
    if (tier && VALID_SUBSCRIPTION_TIERS.includes(tier)) {
      const chosenTier = tier;
      currentCoupleInfo.selectedTier = chosenTier;
      updateData.coupleInfo = currentCoupleInfo;
      if (!updateData.activeUntil && (!targetInv.activeUntil || targetInv.activeUntil <= /* @__PURE__ */ new Date())) {
        const oneYear = /* @__PURE__ */ new Date();
        oneYear.setDate(oneYear.getDate() + 365);
        updateData.activeUntil = oneYear;
      }
      await prisma_default.paymentTransaction.create({
        data: {
          orderId: `ADMIN-GRANT-${Date.now()}`,
          userId: targetInv.userId,
          invitationId: targetInv.id,
          tier: chosenTier,
          amount: 0,
          paymentType: "GATEWAY",
          paymentStatus: "SETTLEMENT",
          verifiedBy: req.user?.email ? `SUPER_ADMIN (${req.user.email})` : "SUPER_ADMIN",
          verifiedAt: /* @__PURE__ */ new Date()
        }
      });
    } else if (tier === "RESET" || tier === "BELUM_PILIH_PAKET") {
      delete currentCoupleInfo.selectedTier;
      updateData.coupleInfo = currentCoupleInfo;
      updateData.activeUntil = null;
      await prisma_default.paymentTransaction.updateMany({
        where: {
          invitationId: targetInv.id,
          paymentStatus: "SETTLEMENT"
        },
        data: {
          paymentStatus: "CANCELLED"
        }
      });
    }
    const updated = await prisma_default.invitation.update({
      where: { id: targetInv.id },
      data: updateData
    });
    try {
      await invalidateInvitationCache(targetInv.id, updated.slug);
    } catch {
    }
    res.json({
      success: true,
      message: "Hak akses dan paket langganan klien berhasil diperbarui oleh Super Admin",
      data: updated
    });
  } catch (error) {
    next(error);
  }
}
async function impersonate(req, res, next) {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) {
      res.status(400).json({ success: false, error: "targetUserId wajib disertakan" });
      return;
    }
    const targetUser = await prisma_default.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, role: true, name: true }
    });
    if (!targetUser) {
      res.status(404).json({ success: false, error: "Pengguna tidak ditemukan" });
      return;
    }
    const token = signJwtToken({
      userId: targetUser.id,
      email: targetUser.email,
      role: targetUser.role
    });
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    res.json({
      success: true,
      message: `Berhasil login sebagai ${targetUser.name}`,
      redirectUrl: "/dashboard"
    });
  } catch (error) {
    next(error);
  }
}
var ALL_DEFAULT_THEME_FEATURES = [
  "music",
  "rsvp",
  "wishes",
  "digital_gift",
  "physical_gift",
  "love_story",
  "gallery",
  "countdown",
  "google_maps",
  "qr_ticket"
];
async function getThemes(_req, res, next) {
  try {
    let sanityThemes = await getSanityThemes();
    if (!sanityThemes || sanityThemes.length === 0) {
      sanityThemes = await seedDefaultThemesToSanity();
    }
    const dbThemes = await prisma_default.themeCatalog.findMany({
      orderBy: { createdAt: "asc" }
    });
    const dbThemesMap = new Map(dbThemes.map((t) => [t.themeKey, t]));
    for (const st of sanityThemes) {
      if (!dbThemesMap.has(st.themeKey)) {
        const created = await prisma_default.themeCatalog.create({
          data: {
            themeKey: st.themeKey,
            name: st.name,
            category: st.category,
            thumbnail: st.thumbnail,
            previewUrl: st.previewUrl,
            isActive: st.isActive,
            isPremium: st.isPremium
          }
        });
        dbThemesMap.set(st.themeKey, created);
      }
    }
    const settings = await prisma_default.systemSetting.findMany({
      where: { key: { startsWith: "template_features_" } }
    });
    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));
    const enriched = sanityThemes.map((st) => {
      const dbItem = dbThemesMap.get(st.themeKey);
      const settingVal = settingsMap.get(`template_features_${st.themeKey}`);
      let parsedFeatures = st.features && st.features.length > 0 ? st.features : ALL_DEFAULT_THEME_FEATURES;
      if (settingVal) {
        try {
          parsedFeatures = JSON.parse(settingVal);
        } catch {
        }
      }
      return {
        id: dbItem?.id || `sanity-${st.themeKey}`,
        themeKey: st.themeKey,
        name: st.name,
        category: st.category,
        thumbnail: st.thumbnail,
        previewUrl: st.previewUrl || `/invitation/demo-${st.themeKey}`,
        isActive: st.isActive,
        isPremium: st.isPremium,
        features: parsedFeatures,
        designConfig: st.designConfig,
        source: "sanity"
      };
    });
    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
}
async function createTheme(req, res, next) {
  try {
    const { themeKey, name, category, thumbnail, isPremium, isActive, features, designConfig } = req.body;
    if (!themeKey || !name || !thumbnail) {
      res.status(400).json({
        success: false,
        error: "themeKey, name, dan thumbnail wajib diisi"
      });
      return;
    }
    const cleanKey = themeKey.toLowerCase().trim();
    const featureList = Array.isArray(features) ? features : ALL_DEFAULT_THEME_FEATURES;
    await createOrUpdateSanityTheme({
      themeKey: cleanKey,
      name,
      category: category || "Modern Chic",
      thumbnail,
      previewUrl: `/invitation/demo-${cleanKey}`,
      isPremium: Boolean(isPremium),
      isActive: isActive !== void 0 ? Boolean(isActive) : true,
      features: featureList,
      designConfig: designConfig || {}
    });
    const newTheme = await prisma_default.themeCatalog.upsert({
      where: { themeKey: cleanKey },
      update: {
        name,
        category: category || "Modern Chic",
        thumbnail,
        isPremium: Boolean(isPremium),
        isActive: isActive !== void 0 ? Boolean(isActive) : true
      },
      create: {
        themeKey: cleanKey,
        name,
        category: category || "Modern Chic",
        thumbnail,
        isPremium: Boolean(isPremium),
        isActive: isActive !== void 0 ? Boolean(isActive) : true
      }
    });
    await prisma_default.systemSetting.upsert({
      where: { key: `template_features_${cleanKey}` },
      update: { value: JSON.stringify(featureList) },
      create: {
        key: `template_features_${cleanKey}`,
        value: JSON.stringify(featureList),
        description: `Fitur aktif untuk tema ${name}`
      }
    });
    res.json({
      success: true,
      message: "Tema baru berhasil ditambahkan ke Sanity CMS & Database",
      data: {
        ...newTheme,
        features: featureList,
        source: "sanity"
      }
    });
  } catch (error) {
    next(error);
  }
}
async function updateTheme(req, res, next) {
  try {
    const { id, name, category, thumbnail, isPremium, isActive, features, designConfig } = req.body;
    if (!id) {
      res.status(400).json({ success: false, error: "id tema wajib disertakan" });
      return;
    }
    const existingTheme = await prisma_default.themeCatalog.findUnique({
      where: { id }
    });
    if (!existingTheme) {
      res.status(404).json({ success: false, error: "Tema tidak ditemukan" });
      return;
    }
    const featureList = features !== void 0 ? Array.isArray(features) ? features : ALL_DEFAULT_THEME_FEATURES : void 0;
    await createOrUpdateSanityTheme({
      themeKey: existingTheme.themeKey,
      name: name || existingTheme.name,
      category: category || existingTheme.category,
      thumbnail: thumbnail || existingTheme.thumbnail,
      isPremium: isPremium !== void 0 ? Boolean(isPremium) : existingTheme.isPremium,
      isActive: isActive !== void 0 ? Boolean(isActive) : existingTheme.isActive,
      ...featureList && { features: featureList },
      ...designConfig && { designConfig }
    });
    const updated = await prisma_default.themeCatalog.update({
      where: { id },
      data: {
        ...name && { name },
        ...category && { category },
        ...thumbnail && { thumbnail },
        ...isPremium !== void 0 && { isPremium: Boolean(isPremium) },
        ...isActive !== void 0 && { isActive: Boolean(isActive) }
      }
    });
    let currentFeatures = ALL_DEFAULT_THEME_FEATURES;
    if (featureList) {
      currentFeatures = featureList;
      await prisma_default.systemSetting.upsert({
        where: { key: `template_features_${updated.themeKey}` },
        update: { value: JSON.stringify(currentFeatures) },
        create: {
          key: `template_features_${updated.themeKey}`,
          value: JSON.stringify(currentFeatures),
          description: `Fitur aktif untuk tema ${updated.name}`
        }
      });
    } else {
      const existingSetting = await prisma_default.systemSetting.findUnique({
        where: { key: `template_features_${updated.themeKey}` }
      });
      if (existingSetting) {
        try {
          currentFeatures = JSON.parse(existingSetting.value);
        } catch {
        }
      }
    }
    res.json({
      success: true,
      message: "Tema berhasil diperbarui di Sanity CMS & Database",
      data: {
        ...updated,
        features: currentFeatures,
        source: "sanity"
      }
    });
  } catch (error) {
    next(error);
  }
}
async function deleteTheme(req, res, next) {
  try {
    const id = req.query.id || req.body?.id;
    if (!id) {
      res.status(400).json({ success: false, error: "id tema wajib disertakan" });
      return;
    }
    const existingTheme = await prisma_default.themeCatalog.findUnique({
      where: { id }
    });
    if (!existingTheme) {
      res.status(404).json({ success: false, error: "Tema tidak ditemukan" });
      return;
    }
    if (existingTheme.themeKey === "botanical") {
      res.status(400).json({
        success: false,
        error: "Tema default 'botanical' adalah fondasi sistem dan tidak boleh dihapus."
      });
      return;
    }
    await deleteSanityTheme(existingTheme.themeKey);
    const affectedInvitations = await prisma_default.invitation.findMany({
      where: { themeId: existingTheme.themeKey },
      select: { id: true, slug: true }
    });
    if (affectedInvitations.length > 0) {
      await prisma_default.invitation.updateMany({
        where: { themeId: existingTheme.themeKey },
        data: { themeId: "botanical" }
      });
      for (const inv of affectedInvitations) {
        invalidateInvitationCache(inv.slug, inv.id);
      }
    }
    if (existingTheme.thumbnail && existingTheme.thumbnail.startsWith("/uploads/")) {
      const uploadPath = path2.join(process.cwd(), existingTheme.thumbnail);
      try {
        await fs2.unlink(uploadPath);
      } catch {
      }
    }
    await prisma_default.themeCatalog.delete({ where: { id } });
    res.json({
      success: true,
      message: affectedInvitations.length > 0 ? `Tema "${existingTheme.name}" berhasil dihapus dari Sanity CMS & Database. ${affectedInvitations.length} undangan aktif telah dialihkan ke tema Minimalist.` : `Tema "${existingTheme.name}" berhasil dihapus dari Sanity CMS & Database.`,
      affectedInvitationsCount: affectedInvitations.length
    });
  } catch (error) {
    next(error);
  }
}
async function adminScanGuestCheckin(req, res, next) {
  try {
    const { invitationId, qrData, slugCode, guestId } = req.body;
    let targetGuest = null;
    if (guestId) {
      targetGuest = await prisma_default.guest.findUnique({
        where: { id: guestId },
        include: { invitation: { select: { title: true, slug: true } } }
      });
    } else if (slugCode && invitationId) {
      targetGuest = await prisma_default.guest.findFirst({
        where: { slugCode, invitationId },
        include: { invitation: { select: { title: true, slug: true } } }
      });
    } else if (qrData) {
      const trimmed = String(qrData).trim();
      let extracted = trimmed;
      try {
        const p = JSON.parse(trimmed);
        if (p.guestId) extracted = p.guestId;
        else if (p.slugCode) extracted = p.slugCode;
      } catch {
      }
      targetGuest = await prisma_default.guest.findFirst({
        where: {
          OR: [{ id: extracted }, { slugCode: extracted }],
          ...invitationId ? { invitationId } : {}
        },
        include: { invitation: { select: { title: true, slug: true } } }
      });
    }
    if (!targetGuest) {
      res.status(404).json({ success: false, error: "Tamu tidak ditemukan" });
      return;
    }
    const isAlreadyCheckedIn = Boolean(targetGuest.checkedInAt);
    let updated = targetGuest;
    if (!isAlreadyCheckedIn) {
      updated = await prisma_default.guest.update({
        where: { id: targetGuest.id },
        data: { checkedInAt: /* @__PURE__ */ new Date() },
        include: { invitation: { select: { title: true, slug: true } } }
      });
    }
    res.json({
      success: true,
      status: isAlreadyCheckedIn ? "ALREADY_CHECKED_IN" : "CHECKIN_SUCCESS",
      message: isAlreadyCheckedIn ? `Tamu "${targetGuest.name}" SUDAH check-in sebelumnya pada ${new Date(
        targetGuest.checkedInAt
      ).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB.` : `Tamu "${targetGuest.name}" (${targetGuest.quota} Pax - ${targetGuest.invitation?.title || ""}) berhasil check-in!`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}
async function getAdminSettings(_req, res, next) {
  try {
    const [dbSettings, sanitySettings] = await Promise.all([
      prisma_default.systemSetting.findMany(),
      getSanityCmsSettings().catch(() => null)
    ]);
    const dbMap = new Map(dbSettings.map((s) => [s.key, s]));
    const merged = SYSTEM_SETTING_DEFINITIONS.map((def) => {
      const fromDb = dbMap.get(def.key);
      const fromSanity = sanitySettings ? sanitySettings[def.key] : void 0;
      return {
        id: fromDb?.id ?? `def-${def.key}`,
        key: def.key,
        value: fromSanity !== void 0 ? fromSanity : fromDb?.value ?? def.defaultValue,
        label: def.label,
        description: fromDb?.description || def.description,
        category: def.category,
        isPublic: def.isPublic
      };
    });
    res.json({ success: true, data: merged });
  } catch (error) {
    next(error);
  }
}
async function updateAdminSettings(req, res, next) {
  try {
    const { settings } = req.body;
    if (!Array.isArray(settings)) {
      res.status(400).json({
        success: false,
        error: "Format data settings tidak valid (wajib array)"
      });
      return;
    }
    for (const item of settings) {
      if (item.key && typeof item.value === "string") {
        await prisma_default.systemSetting.upsert({
          where: { key: item.key },
          update: {
            value: item.value,
            ...item.description && { description: item.description }
          },
          create: {
            key: item.key,
            value: item.value,
            description: item.description || null
          }
        });
      }
    }
    const updatedSettings = await prisma_default.systemSetting.findMany({
      orderBy: { key: "asc" }
    });
    void syncCmsSettingsToSanity(updatedSettings).catch((err) => {
      console.error("[AdminSettings] Sanity sync background error:", err);
    });
    res.json({
      success: true,
      message: "Pengaturan sistem berhasil disimpan",
      data: updatedSettings
    });
  } catch (error) {
    next(error);
  }
}
async function getAdminPayments(req, res, next) {
  try {
    const statusParam = req.query.status || "ALL";
    const tierParam = req.query.tier || "ALL";
    const search = (req.query.search || "").trim();
    const now = /* @__PURE__ */ new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const where = {};
    if (statusParam !== "ALL") {
      where.paymentStatus = statusParam;
    }
    if (tierParam !== "ALL") {
      where.tier = tierParam;
    }
    if (search) {
      where.OR = [
        { orderId: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { invitation: { slug: { contains: search, mode: "insensitive" } } },
        { invitation: { title: { contains: search, mode: "insensitive" } } }
      ];
    }
    const [transactions, allTransactions] = await Promise.all([
      prisma_default.paymentTransaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              invitations: {
                take: 1,
                select: { coupleInfo: true }
              }
            }
          },
          invitation: {
            select: { id: true, title: true, slug: true, coupleInfo: true }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 150
      }),
      prisma_default.paymentTransaction.findMany({
        select: {
          id: true,
          amount: true,
          paymentStatus: true,
          paymentType: true,
          tier: true,
          createdAt: true
        }
      })
    ]);
    let totalAllTimeRevenue = 0;
    let monthlySettledRevenue = 0;
    let settledCount = 0;
    let waitingVerificationCount = 0;
    let pendingCount = 0;
    let expiredOrCancelledCount = 0;
    const tierBreakdown = {
      STARTER: { count: 0, totalAmount: 0 },
      ELEGANT: { count: 0, totalAmount: 0 },
      ULTIMATE: { count: 0, totalAmount: 0 }
    };
    const methodBreakdown = {
      GATEWAY: { count: 0, totalAmount: 0 },
      MANUAL_QRIS: { count: 0, totalAmount: 0 },
      MANUAL_BANK: { count: 0, totalAmount: 0 }
    };
    for (const tx of allTransactions) {
      const amount = Number(tx.amount || 0);
      if (tx.paymentStatus === "SETTLEMENT") {
        settledCount += 1;
        totalAllTimeRevenue += amount;
        if (new Date(tx.createdAt) >= startOfMonth) {
          monthlySettledRevenue += amount;
        }
        if (tierBreakdown[tx.tier]) {
          tierBreakdown[tx.tier].count += 1;
          tierBreakdown[tx.tier].totalAmount += amount;
        }
        if (methodBreakdown[tx.paymentType]) {
          methodBreakdown[tx.paymentType].count += 1;
          methodBreakdown[tx.paymentType].totalAmount += amount;
        }
      } else if (tx.paymentStatus === "WAITING_VERIFICATION") {
        waitingVerificationCount += 1;
      } else if (tx.paymentStatus === "PENDING") {
        pendingCount += 1;
      } else {
        expiredOrCancelledCount += 1;
      }
    }
    res.json({
      success: true,
      data: {
        transactions: transactions.map((tx) => {
          const couple = tx.invitation?.coupleInfo || tx.user?.invitations?.[0]?.coupleInfo || {};
          const phone = (typeof couple.phoneNumber === "string" ? couple.phoneNumber : null) || (typeof couple.giftPhone === "string" ? couple.giftPhone : null) || null;
          const groom = typeof couple.groomName === "string" ? couple.groomName : "";
          const bride = typeof couple.brideName === "string" ? couple.brideName : "";
          return {
            id: tx.id,
            orderId: tx.orderId,
            amount: Number(tx.amount),
            paymentType: tx.paymentType,
            paymentStatus: tx.paymentStatus,
            tier: tx.tier,
            proofImageUrl: tx.proofImageUrl,
            verifiedAt: tx.verifiedAt,
            verifiedBy: tx.verifiedBy,
            createdAt: tx.createdAt,
            user: tx.user,
            clientPhone: phone,
            groomName: groom,
            brideName: bride,
            invitation: tx.invitation ? {
              id: tx.invitation.id,
              title: tx.invitation.title,
              slug: tx.invitation.slug
            } : null
          };
        }),
        analytics: {
          totalAllTimeRevenue,
          monthlySettledRevenue,
          totalTransactionsCount: allTransactions.length,
          settledCount,
          waitingVerificationCount,
          pendingCount,
          expiredOrCancelledCount,
          tierBreakdown,
          methodBreakdown
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
async function getVerifyPayments(req, res, next) {
  try {
    const status = req.query.status || "WAITING_VERIFICATION";
    const search = (req.query.search || "").trim();
    const paymentType = req.query.paymentType || "";
    const whereClause = {};
    if (status && status !== "ALL") {
      whereClause.paymentStatus = status;
    }
    if (paymentType && paymentType !== "ALL") {
      whereClause.paymentType = paymentType;
    } else {
      whereClause.paymentType = {
        in: [PaymentType.MANUAL_BANK, PaymentType.MANUAL_QRIS]
      };
    }
    if (search) {
      whereClause.OR = [
        { orderId: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { invitation: { title: { contains: search, mode: "insensitive" } } },
        { invitation: { slug: { contains: search, mode: "insensitive" } } }
      ];
    }
    const transactions = await prisma_default.paymentTransaction.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            invitations: {
              take: 1,
              select: { coupleInfo: true }
            }
          }
        },
        invitation: {
          select: { id: true, title: true, slug: true, coupleInfo: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    const mapped = transactions.map((tx) => {
      const couple = tx.invitation?.coupleInfo || tx.user?.invitations?.[0]?.coupleInfo || {};
      const phone = (typeof couple.phoneNumber === "string" ? couple.phoneNumber : null) || (typeof couple.giftPhone === "string" ? couple.giftPhone : null) || null;
      const groom = typeof couple.groomName === "string" ? couple.groomName : "";
      const bride = typeof couple.brideName === "string" ? couple.brideName : "";
      return {
        ...tx,
        clientPhone: phone,
        groomName: groom,
        brideName: bride
      };
    });
    res.json({ data: mapped });
  } catch (error) {
    next(error);
  }
}
async function actionVerifyPayment(req, res, next) {
  try {
    const session = req.user;
    const schema = z2.object({
      transactionId: z2.string().min(1, "ID transaksi wajib diisi"),
      action: z2.enum(["APPROVE", "REJECT"]),
      rejectionReason: z2.string().max(250).optional().nullable()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi aksi verifikasi gagal",
        details: parsed.error.format()
      });
      return;
    }
    const { transactionId, action } = parsed.data;
    const transaction = await prisma_default.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { invitation: true }
    });
    if (!transaction) {
      res.status(404).json({ error: "Data transaksi tidak ditemukan" });
      return;
    }
    if (action === "APPROVE") {
      const activeUntil = /* @__PURE__ */ new Date();
      let durationDesc = "365 hari (1 Tahun)";
      if (transaction.tier === "STARTER") {
        activeUntil.setDate(activeUntil.getDate() + 90);
        durationDesc = "90 hari";
      } else if (transaction.tier === "ULTIMATE") {
        activeUntil.setFullYear(activeUntil.getFullYear() + 100);
        durationDesc = "Lifetime (Selamanya)";
      } else {
        activeUntil.setFullYear(activeUntil.getFullYear() + 1);
        durationDesc = "365 hari (1 Tahun)";
      }
      const updated2 = await prisma_default.$transaction(async (tx) => {
        const txUpdated = await tx.paymentTransaction.update({
          where: { id: transactionId },
          data: {
            paymentStatus: "SETTLEMENT",
            verifiedBy: session.email,
            verifiedAt: /* @__PURE__ */ new Date()
          }
        });
        let targetInvId = transaction.invitationId;
        if (!targetInvId) {
          let userInv = await tx.invitation.findFirst({
            where: { userId: transaction.userId }
          });
          if (!userInv) {
            userInv = await tx.invitation.create({
              data: {
                slug: `undangan-${transaction.userId.slice(-6)}`,
                title: "Pernikahan Mempelai",
                userId: transaction.userId,
                themeId: "botanical",
                isActive: true,
                activeUntil,
                coupleInfo: {
                  selectedTier: transaction.tier
                }
              }
            });
          }
          targetInvId = userInv.id;
          await tx.paymentTransaction.update({
            where: { id: transactionId },
            data: { invitationId: targetInvId }
          });
        }
        if (targetInvId) {
          const inv = await tx.invitation.findUnique({
            where: { id: targetInvId }
          });
          const coupleInfo = inv?.coupleInfo || {};
          await tx.invitation.update({
            where: { id: targetInvId },
            data: {
              isActive: true,
              activeUntil,
              coupleInfo: {
                ...coupleInfo,
                selectedTier: transaction.tier
              }
            }
          });
        }
        return txUpdated;
      });
      res.json({
        message: `Transaksi berhasil disetujui & paket ${transaction.tier} aktif (${durationDesc})`,
        data: updated2
      });
      return;
    }
    const updated = await prisma_default.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        paymentStatus: "CANCELLED",
        verifiedBy: session.email,
        verifiedAt: /* @__PURE__ */ new Date()
      }
    });
    res.json({
      message: "Transaksi berhasil ditolak dan dibatalkan",
      data: updated
    });
  } catch (error) {
    next(error);
  }
}
async function getUserRoles(_req, res, next) {
  try {
    const users = await prisma_default.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        invitations: {
          select: {
            id: true,
            title: true,
            slug: true,
            isActive: true,
            coupleInfo: true
          },
          take: 1
        }
      }
    });
    const formatted = users.map((u) => {
      const inv = u.invitations[0] || null;
      const coupleInfo = inv?.coupleInfo || {};
      const selectedTier = coupleInfo.selectedTier || null;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
        invitation: inv ? {
          id: inv.id,
          title: inv.title,
          slug: inv.slug,
          isActive: inv.isActive,
          tier: selectedTier || "STARTER"
        } : null
      };
    });
    formatted.sort((a, b) => {
      if (a.email === "admin@admin.com") return -1;
      if (b.email === "admin@admin.com") return 1;
      if (a.role === "ADMIN" && b.role !== "ADMIN") return -1;
      if (b.role === "ADMIN" && a.role !== "ADMIN") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
}
async function patchUserRole(req, res, next) {
  try {
    const session = req.user;
    const { userId, role } = req.body;
    if (!userId || !role) {
      res.status(400).json({ success: false, error: "userId dan role wajib disertakan" });
      return;
    }
    if (role !== "ADMIN" && role !== "USER") {
      res.status(400).json({ success: false, error: "Nilai role harus berupa 'ADMIN' atau 'USER'" });
      return;
    }
    const targetUser = await prisma_default.user.findUnique({
      where: { id: userId }
    });
    if (!targetUser) {
      res.status(404).json({ success: false, error: "Pengguna tidak ditemukan" });
      return;
    }
    if (targetUser.email === "admin@admin.com" && role !== "ADMIN") {
      res.status(403).json({
        success: false,
        error: "Akun Super Admin utama (admin@admin.com) dilindungi dan tidak dapat diubah hak aksesnya."
      });
      return;
    }
    if (targetUser.id === session.userId && role !== "ADMIN") {
      const adminCount = await prisma_default.user.count({
        where: { role: UserRole2.ADMIN }
      });
      if (adminCount <= 1) {
        res.status(400).json({
          success: false,
          error: "Tidak dapat menurunkan hak akses akun sendiri karena Anda adalah satu-satunya Admin yang aktif di sistem."
        });
        return;
      }
    }
    const updatedUser = await prisma_default.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
      }
    });
    res.json({
      success: true,
      message: `Hak akses pengguna ${updatedUser.name} (${updatedUser.email}) berhasil diubah menjadi ${role}.`,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
}
async function getMaintenance(_req, res, next) {
  try {
    const startTime = Date.now();
    await prisma_default.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startTime;
    const [
      totalUsers,
      totalInvitations,
      totalTransactions,
      totalWishes,
      totalRsvps,
      totalSettings
    ] = await Promise.all([
      prisma_default.user.count(),
      prisma_default.invitation.count(),
      prisma_default.paymentTransaction.count(),
      prisma_default.wish.count(),
      prisma_default.rsvp.count(),
      prisma_default.systemSetting.count()
    ]);
    const memoryUsage = process.memoryUsage();
    res.json({
      success: true,
      data: {
        serverStatus: "healthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        nodeEnv: process.env.NODE_ENV || "development",
        database: {
          status: "connected",
          latencyMs: dbLatencyMs,
          provider: "PostgreSQL"
        },
        memory: {
          heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rssMb: Math.round(memoryUsage.rss / 1024 / 1024)
        },
        metrics: {
          totalUsers,
          totalInvitations,
          totalTransactions,
          totalWishes,
          totalRsvps,
          totalSettings
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
async function actionMaintenance(req, res, next) {
  try {
    const { action } = req.body;
    if (!action) {
      res.status(400).json({ success: false, error: "Parameter action wajib disertakan" });
      return;
    }
    if (action === "ping_db") {
      const startTime = Date.now();
      await prisma_default.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - startTime;
      res.json({
        success: true,
        message: `Koneksi database prima (Latensi: ${latencyMs} ms)`,
        latencyMs
      });
      return;
    }
    if (action === "seed_defaults") {
      let createdCount = 0;
      for (const def of SYSTEM_SETTING_DEFINITIONS) {
        const existing = await prisma_default.systemSetting.findUnique({
          where: { key: def.key }
        });
        if (!existing) {
          await prisma_default.systemSetting.create({
            data: {
              key: def.key,
              value: def.defaultValue,
              description: def.description
            }
          });
          createdCount++;
        }
      }
      res.json({
        success: true,
        message: `Sinkronisasi selesai: ${createdCount} pengaturan baru ditambahkan.`,
        createdCount
      });
      return;
    }
    if (action === "clear_cache") {
      res.json({
        success: true,
        message: "Cache memori dan revalidasi halaman publik berhasil dibersihkan.",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      return;
    }
    if (action === "reset_sales") {
      const deleteResult = await prisma_default.paymentTransaction.deleteMany({});
      res.json({
        success: true,
        message: `Seluruh data penjualan admin berhasil direset. ${deleteResult.count} riwayat transaksi telah dihapus.`,
        deletedCount: deleteResult.count
      });
      return;
    }
    if (action === "test_sanity") {
      const sanityStatus = await testSanityConnection();
      res.json({
        success: sanityStatus.connected,
        message: sanityStatus.connected ? `Koneksi Sanity CMS prima (Latensi: ${sanityStatus.latencyMs} ms, Project: ${sanityStatus.projectId}, Dataset: ${sanityStatus.dataset})` : `Gagal terhubung ke Sanity CMS: ${sanityStatus.error}`,
        data: sanityStatus
      });
      return;
    }
    if (action === "sync_all_to_sanity") {
      const [allInvitations, allSettings] = await Promise.all([
        prisma_default.invitation.findMany({
          include: {
            eventSchedules: true,
            galleries: true,
            bankAccounts: true
          }
        }),
        prisma_default.systemSetting.findMany()
      ]);
      let syncedInvitations = 0;
      for (const inv of allInvitations) {
        const resSync = await syncInvitationToSanity({
          id: inv.id,
          slug: inv.slug,
          title: inv.title,
          themeId: inv.themeId,
          isActive: inv.isActive,
          activeUntil: inv.activeUntil,
          coupleInfo: inv.coupleInfo || {},
          eventSchedules: inv.eventSchedules,
          galleries: inv.galleries,
          bankAccounts: inv.bankAccounts
        });
        if (resSync.success) syncedInvitations++;
      }
      await syncCmsSettingsToSanity(allSettings);
      res.json({
        success: true,
        message: `Sinkronisasi massal ke Sanity CMS selesai: ${syncedInvitations} undangan dan ${allSettings.length} pengaturan berhasil disimpan ke cloud Sanity.`,
        syncedInvitations,
        syncedSettings: allSettings.length
      });
      return;
    }
    if (action === "export_backup") {
      const [users, invitations, paymentTransactions, systemSettings, themeCatalogs] = await Promise.all([
        prisma_default.user.findMany({
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true
          }
        }),
        prisma_default.invitation.findMany({
          select: {
            id: true,
            slug: true,
            title: true,
            themeId: true,
            activeUntil: true,
            isActive: true,
            userId: true,
            createdAt: true
          }
        }),
        prisma_default.paymentTransaction.findMany({
          take: 500,
          orderBy: { createdAt: "desc" }
        }),
        prisma_default.systemSetting.findMany({
          orderBy: { key: "asc" }
        }),
        prisma_default.themeCatalog.findMany({
          orderBy: { name: "asc" }
        })
      ]);
      const backupPayload = {
        fasaroBackupVersion: "1.0",
        exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
        summary: {
          usersCount: users.length,
          invitationsCount: invitations.length,
          transactionsCount: paymentTransactions.length,
          settingsCount: systemSettings.length,
          themesCount: themeCatalogs.length
        },
        data: {
          users,
          invitations,
          paymentTransactions,
          systemSettings,
          themeCatalogs
        }
      };
      res.json({
        success: true,
        message: "Cadangan data sistem berhasil disiapkan.",
        backup: backupPayload
      });
      return;
    }
    res.status(400).json({ success: false, error: `Action '${action}' tidak dikenali` });
  } catch (error) {
    next(error);
  }
}
async function adminUpload(req, res, next) {
  try {
    const file = req.file;
    const folder = req.body.folder || "cms";
    if (!file) {
      res.status(400).json({ success: false, error: "File gambar wajib diunggah" });
      return;
    }
    const sanityUpload = await uploadSanityAsset(
      file.buffer,
      file.originalname,
      file.mimetype || "image/jpeg"
    );
    if (sanityUpload.success && sanityUpload.url) {
      res.json({
        success: true,
        url: sanityUpload.url,
        filename: file.originalname,
        sizeBytes: file.size,
        mimeType: file.mimetype,
        storageProvider: "sanity_cdn"
      });
      return;
    }
    const sanitizedFolder = folder.replace(/[^a-z0-9_-]/gi, "").toLowerCase() || "cms";
    const uploadDir = path2.join(process.cwd(), "public", "uploads", sanitizedFolder);
    await fs2.mkdir(uploadDir, { recursive: true });
    const originalExt = path2.extname(file.originalname).toLowerCase() || ".jpg";
    const cleanBaseName = path2.basename(file.originalname, originalExt).toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);
    const uniqueFilename = `${Date.now()}-${cleanBaseName}${originalExt}`;
    const filePath = path2.join(uploadDir, uniqueFilename);
    await fs2.writeFile(filePath, file.buffer);
    res.json({
      success: true,
      url: `/uploads/${sanitizedFolder}/${uniqueFilename}`,
      filename: uniqueFilename,
      sizeBytes: file.size,
      mimeType: file.mimetype,
      storageProvider: "local"
    });
  } catch (error) {
    next(error);
  }
}

// server/controllers/upload.controller.ts
import fs3 from "fs/promises";
import path3 from "path";
import multer from "multer";
import { z as z3 } from "zod";

// server/services/supabase.service.ts
import { createClient as createClient2 } from "@supabase/supabase-js";
var rawSupabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aummjkryzfezlyikbnpm.supabase.co";
var supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
var supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
var supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
var SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "wedding-assets";
var cachedAdminClient = null;
function getSupabaseAdminClient() {
  if (!cachedAdminClient) {
    cachedAdminClient = createClient2(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return cachedAdminClient;
}
function getPublicStorageUrl(path5, bucket = SUPABASE_STORAGE_BUCKET) {
  const supabase = getSupabaseAdminClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path5);
  return data.publicUrl;
}
async function generateSignedUploadUrl(path5, options, bucket = SUPABASE_STORAGE_BUCKET) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path5, { upsert: options?.upsert ?? false });
  if (error || !data) {
    throw new Error(
      `Gagal membuat upload URL Supabase: ${error?.message || "Unknown error"}`
    );
  }
  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path
  };
}

// server/controllers/upload.controller.ts
var uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
  // 20MB max buffer
});
async function uploadImage(req, res, next) {
  try {
    const user = req.user;
    const file = req.file;
    const folderParam = req.body.folder || "couples";
    const folder = ALLOWED_FOLDERS.has(folderParam) ? folderParam : "couples";
    if (!file) {
      res.status(400).json({ success: false, error: "File gambar wajib dipilih" });
      return;
    }
    const originalExt = path3.extname(file.originalname).toLowerCase();
    const isValidType = ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype) || ALLOWED_IMAGE_EXTENSIONS.has(originalExt);
    if (!isValidType) {
      res.status(400).json({
        success: false,
        error: "Format gambar tidak didukung. Harap gunakan format JPG, PNG, atau WebP."
      });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      res.status(400).json({
        success: false,
        error: "Ukuran gambar terlalu besar. Maksimal 10MB."
      });
      return;
    }
    if ((folder === "couples" || folder === "galleries") && file.size > 1.15 * 1024 * 1024) {
      res.status(400).json({
        success: false,
        error: "Ukuran foto galeri dan foto mempelai maksimal 1MB."
      });
      return;
    }
    const cleanBaseName = path3.basename(file.originalname, originalExt).toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 30);
    const safeExt = originalExt || ".jpg";
    const uniqueFilename = `${folder}-${Date.now()}-${cleanBaseName}${safeExt}`;
    const buffer = file.buffer;
    let publicUrl = null;
    try {
      const storageKey = `${folder}/${user.userId}/${uniqueFilename}`;
      const supabase = getSupabaseAdminClient();
      const { error: uploadError } = await supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(storageKey, buffer, {
        contentType: file.mimetype || "image/jpeg",
        upsert: true
      });
      if (!uploadError) {
        publicUrl = getPublicStorageUrl(storageKey);
      }
    } catch {
      publicUrl = null;
    }
    if (!publicUrl) {
      const uploadDir = path3.join(process.cwd(), "public", "uploads", folder);
      await fs3.mkdir(uploadDir, { recursive: true });
      const localFilePath = path3.join(uploadDir, uniqueFilename);
      await fs3.writeFile(localFilePath, buffer);
      publicUrl = `/uploads/${folder}/${uniqueFilename}`;
    }
    res.json({
      success: true,
      url: publicUrl,
      fileName: file.originalname,
      size: file.size
    });
  } catch (error) {
    next(error);
  }
}
async function uploadMusic(req, res, next) {
  try {
    const user = req.user;
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: "File audio wajib dipilih" });
      return;
    }
    const originalExt = path3.extname(file.originalname).toLowerCase();
    const isValidType = ALLOWED_MUSIC_MIME_TYPES.has(file.mimetype) || ALLOWED_MUSIC_EXTENSIONS.has(originalExt);
    if (!isValidType) {
      res.status(400).json({
        success: false,
        error: "Format audio tidak didukung. Harap gunakan format MP3, M4A, WAV, atau OGG."
      });
      return;
    }
    if (file.size > MAX_MUSIC_SIZE) {
      res.status(400).json({
        success: false,
        error: "Ukuran audio terlalu besar. Maksimal ukuran 15MB."
      });
      return;
    }
    const cleanBaseName = path3.basename(file.originalname, originalExt).toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 40);
    const safeExt = originalExt || ".mp3";
    const uniqueFilename = `music-${Date.now()}-${cleanBaseName}${safeExt}`;
    const buffer = file.buffer;
    let publicUrl = null;
    try {
      const storageKey = `music/${user.userId}/${uniqueFilename}`;
      const supabase = getSupabaseAdminClient();
      const { error: uploadError } = await supabase.storage.from(SUPABASE_STORAGE_BUCKET).upload(storageKey, buffer, {
        contentType: file.mimetype || "audio/mpeg",
        upsert: true
      });
      if (!uploadError) {
        publicUrl = getPublicStorageUrl(storageKey);
      }
    } catch {
      publicUrl = null;
    }
    if (!publicUrl) {
      const uploadDir = path3.join(process.cwd(), "public", "uploads", "music");
      await fs3.mkdir(uploadDir, { recursive: true });
      const localFilePath = path3.join(uploadDir, uniqueFilename);
      await fs3.writeFile(localFilePath, buffer);
      publicUrl = `/uploads/music/${uniqueFilename}`;
    }
    res.json({
      success: true,
      url: publicUrl,
      fileName: file.originalname,
      size: file.size
    });
  } catch (error) {
    next(error);
  }
}
async function uploadPaymentProof(req, res, next) {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: "File bukti transfer wajib dipilih" });
      return;
    }
    const originalExt = path3.extname(file.originalname).toLowerCase() || ".jpg";
    const cleanBaseName = path3.basename(file.originalname, originalExt).toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 25);
    const uniqueFilename = `proof-${Date.now()}-${cleanBaseName}${originalExt}`;
    const uploadDir = path3.join(process.cwd(), "public", "uploads", "proofs");
    await fs3.mkdir(uploadDir, { recursive: true });
    const filePath = path3.join(uploadDir, uniqueFilename);
    await fs3.writeFile(filePath, file.buffer);
    const publicUrl = `/uploads/proofs/${uniqueFilename}`;
    res.json({
      success: true,
      url: publicUrl,
      fileName: file.originalname,
      size: file.size
    });
  } catch (error) {
    next(error);
  }
}
async function getPresignedUrl(req, res, next) {
  try {
    const user = req.user;
    const schema = z3.object({
      filename: z3.string().min(1, "Filename wajib disertakan"),
      contentType: z3.string().regex(/^image\/(jpeg|jpg|png|webp|gif)$/, "Tipe file harus berupa gambar"),
      folder: z3.enum(["galleries", "couples", "qris", "proofs"]).default("galleries")
    });
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: "Parameter tidak valid",
        details: parsed.error.format()
      });
      return;
    }
    const cleanFilename = parsed.data.filename.toLowerCase().replace(/[^a-z0-9.]/g, "-").replace(/-+/g, "-");
    const key = `${parsed.data.folder}/${user.userId}/${Date.now()}-${cleanFilename}`;
    const { signedUrl, token } = await generateSignedUploadUrl(key, { upsert: true });
    const fileUrl = getPublicStorageUrl(key);
    res.json({
      uploadUrl: signedUrl,
      fileUrl,
      key,
      token,
      expiresIn: 300
    });
  } catch (error) {
    next(error);
  }
}

// server/routes/admin.routes.ts
var router5 = Router5();
router5.use(adminMiddleware);
router5.get("/metrics", getMetrics);
router5.get("/clients", getClients);
router5.patch("/clients", patchClient);
router5.post("/impersonate", impersonate);
router5.get("/themes", getThemes);
router5.post("/themes", createTheme);
router5.put("/themes", updateTheme);
router5.delete("/themes", deleteTheme);
router5.get("/settings", getAdminSettings);
router5.put("/settings", updateAdminSettings);
router5.get("/payments", getAdminPayments);
router5.get("/verify-payment", getVerifyPayments);
router5.post("/verify-payment", actionVerifyPayment);
router5.get("/users/role", getUserRoles);
router5.patch("/users/role", patchUserRole);
router5.get("/maintenance", getMaintenance);
router5.post("/maintenance", actionMaintenance);
router5.post("/upload", uploadMemory.single("file"), adminUpload);
router5.post("/guests/scan", adminScanGuestCheckin);
var admin_routes_default = router5;

// server/routes/upload.routes.ts
import { Router as Router6 } from "express";
var router6 = Router6();
router6.post(
  "/image",
  authMiddleware,
  rateLimitMiddleware("upload_image", 20, 60),
  uploadMemory.single("file"),
  uploadImage
);
router6.post(
  "/music",
  authMiddleware,
  rateLimitMiddleware("upload_music", 10, 60),
  uploadMemory.single("file"),
  uploadMusic
);
router6.post(
  "/payment-proof",
  rateLimitMiddleware("upload_proof", 10, 60),
  uploadMemory.single("file"),
  uploadPaymentProof
);
router6.get(
  "/presigned-url",
  authMiddleware,
  rateLimitMiddleware("upload_presigned", 20, 3600),
  getPresignedUrl
);
var upload_routes_default = router6;

// server/routes/payment.routes.ts
import { Router as Router7 } from "express";

// server/services/payment.service.ts
import crypto4 from "crypto";
function isMidtransProduction() {
  const serverKey = getMidtransServerKey();
  if (serverKey.startsWith("Mid-server-")) {
    return true;
  }
  if (serverKey.startsWith("SB-Mid-server-")) {
    return false;
  }
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}
function getMidtransServerKey() {
  return process.env.MIDTRANS_SERVER_KEY || "";
}
function getSnapApiUrl() {
  return isMidtransProduction() ? "https://app.midtrans.com/snap/v1/transactions" : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}
async function createSnapTransaction(orderId, amount, customerDetails) {
  const serverKey = getMidtransServerKey();
  const snapApiUrl = getSnapApiUrl();
  const authHeader = Buffer.from(`${serverKey}:`).toString("base64");
  const payload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: Math.round(amount)
    },
    customer_details: {
      first_name: customerDetails.first_name,
      email: customerDetails.email,
      phone: customerDetails.phone ?? ""
    },
    credit_card: {
      secure: true
    }
  };
  if (!serverKey || serverKey.includes("YOUR_SANDBOX")) {
    return {
      token: `mock_snap_${orderId}_${Date.now()}`,
      redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/mock_snap_${orderId}`
    };
  }
  const response = await fetch(snapApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${authHeader}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Midtrans Sandbox API error (${response.status}): ${errorBody}`);
  }
  return response.json();
}
function verifyMidtransSignature(orderId, statusCode, grossAmount, signatureKey) {
  const serverKey = getMidtransServerKey();
  const hashString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const computedHash = crypto4.createHash("sha512").update(hashString).digest("hex");
  return computedHash.toLowerCase() === signatureKey.toLowerCase();
}

// server/controllers/payment.controller.ts
async function createOrder(req, res, next) {
  try {
    const user = req.user;
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi data pembayaran gagal",
        details: parsed.error.format()
      });
      return;
    }
    const { invitationId, tier, amount, paymentType, proofImageUrl } = parsed.data;
    if (invitationId) {
      const invitation = await prisma_default.invitation.findFirst({
        where: {
          id: invitationId,
          userId: user.userId
        }
      });
      if (!invitation) {
        res.status(404).json({ error: "Undangan tidak ditemukan atau bukan milik Anda" });
        return;
      }
    }
    const singlePromoSetting = await prisma_default.systemSetting.findUnique({
      where: { key: "single_promo_mode" }
    });
    const isSinglePromo = singlePromoSetting ? singlePromoSetting.value !== "false" : true;
    let verifiedAmount;
    if (isSinglePromo) {
      const promoPriceSetting = await prisma_default.systemSetting.findUnique({
        where: { key: "promo_plan_price" }
      });
      verifiedAmount = promoPriceSetting ? parseInt(promoPriceSetting.value, 10) || 79e3 : 79e3;
    } else {
      const priceKey = `price_${tier.toLowerCase()}`;
      const priceSetting = await prisma_default.systemSetting.findUnique({
        where: { key: priceKey }
      });
      const defaultPrices = {
        STARTER: 39e3,
        ELEGANT: 149e3,
        ULTIMATE: 279e3
      };
      const officialPrice = priceSetting ? parseInt(priceSetting.value, 10) || defaultPrices[tier] : defaultPrices[tier];
      verifiedAmount = officialPrice > 0 ? officialPrice : amount;
    }
    const orderId = `FSR-${Date.now()}-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const activeModeSetting = await prisma_default.systemSetting.findUnique({
      where: { key: "payment_active_mode" }
    });
    const activeMode = activeModeSetting?.value || "MANUAL_ONLY";
    if (paymentType === "GATEWAY") {
      if (activeMode === "MANUAL_ONLY") {
        res.status(403).json({
          error: "Pembayaran otomatis via Midtrans sedang dinonaktifkan oleh platform. Silakan gunakan metode Transfer Bank / QRIS Manual."
        });
        return;
      }
      const midtransFlag = await prisma_default.systemSetting.findUnique({
        where: { key: "feature_midtrans_payment" }
      });
      if (midtransFlag && midtransFlag.value === "false") {
        res.status(403).json({
          error: "Pembayaran otomatis via Midtrans sedang dalam pemeliharaan. Silakan gunakan metode Transfer Bank / QRIS Manual."
        });
        return;
      }
      const snapData = await createSnapTransaction(orderId, verifiedAmount, {
        first_name: user.email.split("@")[0],
        email: user.email
      });
      const transaction2 = await prisma_default.paymentTransaction.create({
        data: {
          orderId,
          userId: user.userId,
          invitationId: invitationId ?? null,
          tier,
          amount: verifiedAmount,
          paymentType: "GATEWAY",
          paymentStatus: "PENDING"
        }
      });
      res.status(201).json({
        message: "Order Midtrans Snap berhasil dibuat",
        data: {
          transactionId: transaction2.id,
          orderId: transaction2.orderId,
          snapToken: snapData.token,
          redirectUrl: snapData.redirect_url
        }
      });
      return;
    }
    if (activeMode === "GATEWAY_ONLY") {
      res.status(403).json({
        error: "Metode transfer manual sedang dinonaktifkan oleh platform. Silakan gunakan pembayaran otomatis Midtrans."
      });
      return;
    }
    const manualFlag = await prisma_default.systemSetting.findUnique({
      where: { key: "feature_manual_payment" }
    });
    if (manualFlag && manualFlag.value === "false") {
      res.status(403).json({
        error: "Metode transfer manual sementara ditutup untuk pemeliharaan sistem."
      });
      return;
    }
    if (!proofImageUrl) {
      res.status(400).json({
        error: "Bukti transfer (proofImageUrl) wajib diunggah untuk metode manual"
      });
      return;
    }
    const transaction = await prisma_default.paymentTransaction.create({
      data: {
        orderId,
        userId: user.userId,
        invitationId: invitationId ?? null,
        tier,
        amount: verifiedAmount,
        paymentType: paymentType === "MANUAL_QRIS" ? "MANUAL_QRIS" : "MANUAL_BANK",
        paymentStatus: "WAITING_VERIFICATION",
        proofImageUrl
      }
    });
    res.status(201).json({
      message: "Pesanan manual berhasil dibuat, menunggu verifikasi admin",
      data: {
        transactionId: transaction.id,
        orderId: transaction.orderId,
        paymentStatus: transaction.paymentStatus
      }
    });
  } catch (error) {
    next(error);
  }
}
async function midtransWebhook(req, res, next) {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status
    } = req.body;
    if (!order_id || !status_code || !gross_amount || !signature_key) {
      res.status(400).json({ error: "Payload webhook Midtrans tidak lengkap" });
      return;
    }
    const isDev = process.env.MIDTRANS_IS_PRODUCTION !== "true";
    const isMock = process.env.MIDTRANS_SERVER_KEY?.includes("YOUR_SANDBOX") || isDev && signature_key === "dev_mock_signature";
    const isSignatureValid = isMock || verifyMidtransSignature(order_id, status_code, gross_amount, signature_key);
    if (!isSignatureValid) {
      res.status(403).json({ error: "Signature key tidak valid" });
      return;
    }
    const transaction = await prisma_default.paymentTransaction.findUnique({
      where: { orderId: order_id },
      include: { invitation: true }
    });
    if (!transaction) {
      res.status(404).json({ error: `Transaksi dengan orderId ${order_id} tidak ditemukan` });
      return;
    }
    const isSettled = transaction_status === "settlement" || transaction_status === "capture" && fraud_status === "accept";
    if (isSettled) {
      const oneYearFromNow = /* @__PURE__ */ new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      await prisma_default.$transaction(async (tx) => {
        await tx.paymentTransaction.update({
          where: { orderId: order_id },
          data: {
            paymentStatus: "SETTLEMENT",
            verifiedAt: /* @__PURE__ */ new Date(),
            verifiedBy: "MIDTRANS_WEBHOOK"
          }
        });
        let targetInvId = transaction.invitationId;
        if (!targetInvId) {
          let userInv = await tx.invitation.findFirst({
            where: { userId: transaction.userId }
          });
          if (!userInv) {
            userInv = await tx.invitation.create({
              data: {
                slug: `undangan-${transaction.userId.slice(-6)}`,
                title: "Pernikahan Mempelai",
                userId: transaction.userId,
                themeId: "botanical",
                isActive: true,
                activeUntil: oneYearFromNow,
                coupleInfo: {
                  selectedTier: transaction.tier
                }
              }
            });
          }
          targetInvId = userInv.id;
          await tx.paymentTransaction.update({
            where: { orderId: order_id },
            data: { invitationId: targetInvId }
          });
        }
        if (targetInvId) {
          await tx.invitation.update({
            where: { id: targetInvId },
            data: {
              isActive: true,
              activeUntil: oneYearFromNow
            }
          });
        }
      });
      res.json({
        message: "Status transaksi berhasil diperbarui ke SETTLEMENT dan undangan diaktifkan"
      });
      return;
    }
    if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
      await prisma_default.paymentTransaction.update({
        where: { orderId: order_id },
        data: {
          paymentStatus: transaction_status === "expire" ? "EXPIRED" : "CANCELLED"
        }
      });
      res.json({
        message: `Status transaksi berhasil diperbarui ke ${transaction_status}`
      });
      return;
    }
    res.json({ message: "Notifikasi diterima tanpa perubahan status" });
  } catch (error) {
    next(error);
  }
}
async function onboardingSetup(req, res, next) {
  try {
    const user = req.user;
    const {
      groomName,
      brideName,
      phoneNumber,
      weddingDate,
      isDateUndecided,
      location,
      slug,
      tier,
      referralCode
    } = req.body;
    if (!tier || !["STARTER", "ELEGANT", "ULTIMATE"].includes(tier)) {
      res.status(400).json({ error: "Pilihan paket tidak valid" });
      return;
    }
    const cleanGroom = (groomName || "").trim().slice(0, 50);
    const cleanBride = (brideName || "").trim().slice(0, 50);
    let invitation = await prisma_default.invitation.findFirst({
      where: { userId: user.userId }
    });
    let finalSlug = invitation?.slug;
    if (slug && slug.trim() !== "") {
      const sanitized = slug.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").slice(0, 30);
      if (sanitized) {
        const exists = await prisma_default.invitation.findFirst({
          where: { slug: sanitized, userId: { not: user.userId } }
        });
        if (!exists) {
          finalSlug = sanitized;
        }
      }
    }
    if (!finalSlug) {
      const g = cleanGroom.replace(/[^a-z0-9]/gi, "").toLowerCase() || "pria";
      const b = cleanBride.replace(/[^a-z0-9]/gi, "").toLowerCase() || "wanita";
      finalSlug = `${g}-${b}-${Math.random().toString(36).substring(2, 6)}`;
    }
    const title = cleanGroom && cleanBride ? `Pernikahan ${cleanGroom} & ${cleanBride}` : "Pernikahan Mempelai";
    const coupleInfo = invitation?.coupleInfo || {};
    coupleInfo.groomName = cleanGroom || coupleInfo.groomName || "Mempelai Pria";
    coupleInfo.groomNickname = cleanGroom.split(" ")[0] || cleanGroom;
    coupleInfo.brideName = cleanBride || coupleInfo.brideName || "Mempelai Wanita";
    coupleInfo.brideNickname = cleanBride.split(" ")[0] || cleanBride;
    coupleInfo.phoneNumber = (phoneNumber || "").trim();
    coupleInfo.location = (location || "").trim();
    coupleInfo.weddingDate = isDateUndecided ? null : weddingDate || null;
    coupleInfo.selectedTier = tier;
    if (referralCode) {
      coupleInfo.referralCode = referralCode.trim();
    }
    if (!invitation) {
      invitation = await prisma_default.invitation.create({
        data: {
          userId: user.userId,
          slug: finalSlug,
          title,
          themeId: "botanical",
          coupleInfo,
          isActive: true
        }
      });
    } else {
      invitation = await prisma_default.invitation.update({
        where: { id: invitation.id },
        data: {
          title,
          slug: finalSlug,
          coupleInfo
        }
      });
    }
    if (weddingDate && !isDateUndecided) {
      const d = new Date(weddingDate);
      if (!isNaN(d.getTime())) {
        const firstSchedule = await prisma_default.eventSchedule.findFirst({
          where: { invitationId: invitation.id }
        });
        if (firstSchedule) {
          await prisma_default.eventSchedule.update({
            where: { id: firstSchedule.id },
            data: {
              date: d,
              address: location || firstSchedule.address
            }
          });
        } else {
          await prisma_default.eventSchedule.create({
            data: {
              invitationId: invitation.id,
              eventName: "Akad & Resepsi",
              date: d,
              startTime: "09:00",
              venueName: location || "Lokasi Acara",
              address: location || "Alamat Acara"
            }
          });
        }
      }
    }
    res.json({
      success: true,
      message: "Data personal berhasil disimpan",
      data: {
        invitationId: invitation.id,
        slug: invitation.slug,
        tier
      }
    });
  } catch (error) {
    next(error);
  }
}
async function getOnboardingState(req, res, next) {
  try {
    const user = req.user;
    const invitation = await prisma_default.invitation.findFirst({
      where: { userId: user.userId },
      include: {
        eventSchedules: {
          orderBy: { date: "asc" },
          take: 1
        }
      }
    });
    if (!invitation) {
      res.json({ data: null });
      return;
    }
    const coupleInfo = invitation.coupleInfo || {};
    const firstSchedule = invitation.eventSchedules?.[0];
    res.json({
      data: {
        invitationId: invitation.id,
        slug: invitation.slug,
        selectedTier: coupleInfo.selectedTier || null,
        groomNickname: coupleInfo.groomNickname || coupleInfo.groomName || "",
        brideNickname: coupleInfo.brideNickname || coupleInfo.brideName || "",
        phoneNumber: coupleInfo.phoneNumber || "",
        weddingDate: firstSchedule?.date || coupleInfo.weddingDate || null,
        location: firstSchedule?.address || firstSchedule?.venueName || coupleInfo.location || "",
        referralCode: coupleInfo.referralCode || ""
      }
    });
  } catch (error) {
    next(error);
  }
}
async function getOrderStatus(req, res, next) {
  try {
    const user = req.user;
    const rawOrderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
    const whereClause = rawOrderId && rawOrderId !== "latest" ? {
      orderId: rawOrderId,
      ...user.role !== "ADMIN" ? { userId: user.userId } : {}
    } : {
      userId: user.userId
    };
    const transaction = await prisma_default.paymentTransaction.findFirst({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        invitation: {
          select: { id: true, title: true, slug: true, activeUntil: true }
        }
      }
    });
    if (!transaction) {
      res.status(404).json({ error: "Pesanan tidak ditemukan" });
      return;
    }
    let paymentMethodName = "Transfer Manual";
    if (transaction.paymentType === "MANUAL_BANK") {
      paymentMethodName = "Transfer Manual (BCA)";
    } else if (transaction.paymentType === "MANUAL_QRIS") {
      paymentMethodName = "Transfer Manual (QRIS)";
    } else if (transaction.paymentType === "GATEWAY") {
      paymentMethodName = "Otomatis (Midtrans)";
    }
    const planNames = {
      STARTER: "Paket Promo All-In-One",
      ELEGANT: "Paket Promo All-In-One",
      ULTIMATE: "Paket Promo All-In-One",
      FREE: "Paket General"
    };
    res.json({
      success: true,
      data: {
        id: transaction.id,
        orderId: transaction.orderId,
        tier: transaction.tier,
        planName: planNames[transaction.tier] || "Paket Promo All-In-One",
        amount: Number(transaction.amount),
        paymentType: transaction.paymentType,
        paymentMethodName,
        paymentStatus: transaction.paymentStatus,
        proofImageUrl: transaction.proofImageUrl,
        createdAt: transaction.createdAt,
        verifiedAt: transaction.verifiedAt,
        invitationSlug: transaction.invitation?.slug || null,
        activeUntil: transaction.invitation?.activeUntil || null
      }
    });
  } catch (error) {
    next(error);
  }
}
async function getMyNotifications(req, res, next) {
  try {
    const user = req.user;
    const transactions = await prisma_default.paymentTransaction.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      take: 6
    });
    const notifications = [];
    for (const tx of transactions) {
      if (tx.paymentStatus === "WAITING_VERIFICATION") {
        notifications.push({
          id: `notif-wait-${tx.id}`,
          type: "WAITING_VERIFICATION",
          title: "Menunggu Verifikasi Pembayaran",
          message: `Bukti transfer pesanan #${tx.orderId} telah kami terima dan sedang diverifikasi oleh Tim Invity.`,
          status: "WAITING_VERIFICATION",
          orderId: tx.orderId,
          createdAt: tx.createdAt,
          link: `/payment-status?orderId=${tx.orderId}`
        });
      } else if (tx.paymentStatus === "SETTLEMENT") {
        notifications.push({
          id: `notif-settle-${tx.id}`,
          type: "PAYMENT_VERIFIED",
          title: "Pembayaran Terverifikasi!",
          message: `Selamat! Pembayaran untuk pesanan #${tx.orderId} telah diverifikasi. Paket Anda kini telah aktif.`,
          status: "SETTLEMENT",
          orderId: tx.orderId,
          createdAt: tx.verifiedAt || tx.createdAt,
          link: "/dashboard"
        });
      } else if (tx.paymentStatus === "CANCELLED") {
        notifications.push({
          id: `notif-cancel-${tx.id}`,
          type: "PAYMENT_CANCELLED",
          title: "Pembayaran Ditolak",
          message: `Bukti transfer pesanan #${tx.orderId} belum dapat disetujui. Silakan periksa kembali bukti Anda.`,
          status: "CANCELLED",
          orderId: tx.orderId,
          createdAt: tx.createdAt,
          link: `/payment-status?orderId=${tx.orderId}`
        });
      }
    }
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
}

// server/routes/payment.routes.ts
var router7 = Router7();
router7.get("/onboarding-state", authMiddleware, getOnboardingState);
router7.post("/onboarding-setup", authMiddleware, onboardingSetup);
router7.post("/create-order", authMiddleware, rateLimitMiddleware("payment_order", 10, 60), createOrder);
router7.get("/order-status/:orderId", authMiddleware, getOrderStatus);
router7.get("/my-notifications", authMiddleware, getMyNotifications);
router7.post("/webhook", midtransWebhook);
var payment_routes_default = router7;

// server/routes/reception.routes.ts
import { Router as Router8 } from "express";

// server/controllers/reception.controller.ts
async function verifyReceptionPin(req, res, next) {
  try {
    const rawSlug = req.params.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
    const { pin } = req.body;
    if (!slug || typeof slug !== "string") {
      res.status(400).json({ success: false, error: "Slug acara tidak valid." });
      return;
    }
    if (!pin || typeof pin !== "string") {
      res.status(400).json({ success: false, error: "PIN Meja Tamu wajib diisi." });
      return;
    }
    const invitation = await prisma_default.invitation.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        coupleInfo: true,
        isActive: true
      }
    });
    if (!invitation || !invitation.isActive) {
      res.status(404).json({ success: false, error: "Undangan tidak ditemukan atau tidak aktif." });
      return;
    }
    const coupleInfo = invitation.coupleInfo || {};
    const expectedPin = String(coupleInfo.receptionPin || "123456").trim();
    if (pin.trim() !== expectedPin) {
      res.status(401).json({
        success: false,
        error: "PIN Meja Tamu salah. Silakan tanyakan kepada pengantin."
      });
      return;
    }
    const token = signReceptionToken({
      role: "RECEPTIONIST",
      invitationId: invitation.id,
      slug: invitation.slug
    });
    const groom = String(coupleInfo.groomNickname || coupleInfo.groomName || "Pengantin");
    const bride = String(coupleInfo.brideNickname || coupleInfo.brideName || "Pengantin");
    res.json({
      success: true,
      message: "Verifikasi PIN berhasil.",
      data: {
        token,
        slug: invitation.slug,
        weddingTitle: invitation.title,
        coupleName: `${groom} & ${bride}`
      }
    });
  } catch (error) {
    next(error);
  }
}
async function getReceptionStats(req, res, next) {
  try {
    const reception = req.reception;
    const [allGuests, recentGuests, invitation] = await Promise.all([
      prisma_default.guest.findMany({
        where: { invitationId: reception.invitationId },
        select: { quota: true, checkedInAt: true }
      }),
      prisma_default.guest.findMany({
        where: {
          invitationId: reception.invitationId,
          checkedInAt: { not: null }
        },
        orderBy: { checkedInAt: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          quota: true,
          checkedInAt: true
        }
      }),
      prisma_default.invitation.findUnique({
        where: { id: reception.invitationId },
        select: { title: true, coupleInfo: true }
      })
    ]);
    const coupleInfo = invitation?.coupleInfo || {};
    const groom = String(coupleInfo.groomNickname || coupleInfo.groomName || "");
    const bride = String(coupleInfo.brideNickname || coupleInfo.brideName || "");
    const totalGuests = allGuests.length;
    const checkedInGuests = allGuests.filter((g) => g.checkedInAt).length;
    const totalPax = allGuests.reduce((acc, g) => acc + (g.quota || 1), 0);
    const checkedInPax = allGuests.filter((g) => g.checkedInAt).reduce((acc, g) => acc + (g.quota || 1), 0);
    res.json({
      success: true,
      data: {
        weddingTitle: invitation?.title || "Buku Tamu Resepsi",
        coupleName: groom && bride ? `${groom} & ${bride}` : "",
        stats: {
          totalGuests,
          checkedInGuests,
          totalPax,
          checkedInPax
        },
        recentCheckins: recentGuests
      }
    });
  } catch (error) {
    next(error);
  }
}
async function getReceptionGuests(req, res, next) {
  try {
    const reception = req.reception;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const guests = await prisma_default.guest.findMany({
      where: {
        invitationId: reception.invitationId,
        ...search ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phoneNumber: { contains: search } }
          ]
        } : {}
      },
      orderBy: [{ checkedInAt: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slugCode: true,
        quota: true,
        phoneNumber: true,
        checkedInAt: true
      }
    });
    res.json({
      success: true,
      data: guests
    });
  } catch (error) {
    next(error);
  }
}
async function scanReceptionGuest(req, res, next) {
  try {
    const reception = req.reception;
    const { qrData, guestId, slugCode } = req.body;
    let targetGuest = null;
    if (guestId) {
      targetGuest = await prisma_default.guest.findFirst({
        where: { id: guestId, invitationId: reception.invitationId }
      });
    } else if (slugCode) {
      targetGuest = await prisma_default.guest.findFirst({
        where: { slugCode, invitationId: reception.invitationId }
      });
    } else if (qrData && typeof qrData === "string") {
      const trimmed = qrData.trim();
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.guestId) {
          targetGuest = await prisma_default.guest.findFirst({
            where: { id: parsed.guestId, invitationId: reception.invitationId }
          });
        } else if (parsed.slugCode) {
          targetGuest = await prisma_default.guest.findFirst({
            where: { slugCode: parsed.slugCode, invitationId: reception.invitationId }
          });
        }
      } catch {
      }
      if (!targetGuest) {
        let extractedCodeOrName = trimmed;
        if (trimmed.includes("?")) {
          try {
            const urlObj = new URL(trimmed.startsWith("http") ? trimmed : `http://dummy.com/${trimmed}`);
            const codeParam = urlObj.searchParams.get("code") || urlObj.searchParams.get("slugCode");
            const toParam = urlObj.searchParams.get("to");
            if (codeParam) extractedCodeOrName = codeParam;
            else if (toParam) extractedCodeOrName = toParam;
          } catch {
          }
        }
        targetGuest = await prisma_default.guest.findFirst({
          where: {
            invitationId: reception.invitationId,
            OR: [
              { id: extractedCodeOrName },
              { slugCode: extractedCodeOrName },
              { name: { equals: extractedCodeOrName, mode: "insensitive" } }
            ]
          }
        });
      }
    }
    if (!targetGuest) {
      res.status(404).json({
        success: false,
        error: "Data tamu tidak ditemukan dalam daftar undangan acara ini."
      });
      return;
    }
    const isAlreadyCheckedIn = Boolean(targetGuest.checkedInAt);
    let updatedGuest = targetGuest;
    if (!isAlreadyCheckedIn) {
      updatedGuest = await prisma_default.guest.update({
        where: { id: targetGuest.id },
        data: { checkedInAt: /* @__PURE__ */ new Date() }
      });
    }
    const allGuests = await prisma_default.guest.findMany({
      where: { invitationId: reception.invitationId },
      select: { quota: true, checkedInAt: true }
    });
    const totalGuests = allGuests.length;
    const checkedInGuests = allGuests.filter((g) => g.checkedInAt).length;
    const totalPax = allGuests.reduce((acc, g) => acc + (g.quota || 1), 0);
    const checkedInPax = allGuests.filter((g) => g.checkedInAt).reduce((acc, g) => acc + (g.quota || 1), 0);
    res.json({
      success: true,
      status: isAlreadyCheckedIn ? "ALREADY_CHECKED_IN" : "CHECKIN_SUCCESS",
      message: isAlreadyCheckedIn ? `Tamu "${targetGuest.name}" SUDAH check-in sebelumnya pada ${new Date(
        targetGuest.checkedInAt
      ).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB.` : `Tamu "${targetGuest.name}" (${targetGuest.quota} Pax) berhasil check-in!`,
      data: {
        guest: {
          id: updatedGuest.id,
          name: updatedGuest.name,
          slugCode: updatedGuest.slugCode,
          quota: updatedGuest.quota,
          phoneNumber: updatedGuest.phoneNumber,
          checkedInAt: updatedGuest.checkedInAt
        },
        stats: {
          totalGuests,
          checkedInGuests,
          totalPax,
          checkedInPax
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
async function toggleReceptionCheckin(req, res, next) {
  try {
    const reception = req.reception;
    const rawGuestId = req.params.guestId;
    const guestId = Array.isArray(rawGuestId) ? rawGuestId[0] : rawGuestId;
    const { checkedIn } = req.body;
    if (!guestId || typeof guestId !== "string") {
      res.status(400).json({ success: false, error: "ID Tamu tidak valid." });
      return;
    }
    const guest = await prisma_default.guest.findFirst({
      where: { id: guestId, invitationId: reception.invitationId }
    });
    if (!guest) {
      res.status(404).json({ success: false, error: "Tamu tidak ditemukan." });
      return;
    }
    const updated = await prisma_default.guest.update({
      where: { id: guestId },
      data: { checkedInAt: checkedIn ? /* @__PURE__ */ new Date() : null },
      select: {
        id: true,
        name: true,
        slugCode: true,
        quota: true,
        phoneNumber: true,
        checkedInAt: true
      }
    });
    res.json({
      success: true,
      message: checkedIn ? `Tamu "${updated.name}" (${updated.quota} Pax) berhasil check-in.` : `Check-in tamu "${updated.name}" berhasil dibatalkan.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// server/routes/reception.routes.ts
var router8 = Router8();
router8.post(
  "/:slug/verify-pin",
  rateLimitMiddleware("reception_verify_pin", 10, 60),
  verifyReceptionPin
);
router8.get("/:slug/stats", receptionAuthMiddleware, getReceptionStats);
router8.get("/:slug/guests", receptionAuthMiddleware, getReceptionGuests);
router8.post("/:slug/scan", receptionAuthMiddleware, scanReceptionGuest);
router8.post("/:slug/guests/:guestId/toggle", receptionAuthMiddleware, toggleReceptionCheckin);
var reception_routes_default = router8;

// server/routes/index.ts
var apiRouter = Router9();
apiRouter.get("/health", async (_req, res) => {
  try {
    const startTime = Date.now();
    await prisma_default.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;
    res.json({
      status: "ok",
      service: "fasaro-backend-api",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      database: "connected",
      latencyMs: latency
    });
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      service: "fasaro-backend-api",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Database connection failed"
    });
  }
});
apiRouter.use("/auth", auth_routes_default);
apiRouter.use("/invitations", invitation_routes_default);
apiRouter.use("/public", public_routes_default);
apiRouter.use("/dashboard", dashboard_routes_default);
apiRouter.use("/reception", reception_routes_default);
apiRouter.use("/admin", admin_routes_default);
apiRouter.use("/upload", upload_routes_default);
apiRouter.use("/payment", payment_routes_default);
var routes_default = apiRouter;

// server/middleware/error.middleware.ts
import { ZodError } from "zod";
function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Validasi data gagal",
      details: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message
      }))
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
    error: message
  });
}

// server/app.ts
dotenv2.config();
var app = express();
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    // allow images/audio to be loaded across origins
    contentSecurityPolicy: false
  })
);
var configuredOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",").map((url) => url.trim()) : [
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || configuredOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use("/uploads", express.static(path4.join(process.cwd(), "public", "uploads")));
app.get("/api", (_req, res) => {
  res.json({
    service: "Fasaro Wedding Platform API (Express.js)",
    version: "1.0.0",
    healthCheck: "/api/health"
  });
});
app.use("/api", routes_default);
app.use("/", routes_default);
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint API tidak ditemukan."
  });
});
app.use(errorHandler);
var app_default = app;
export {
  app,
  app_default as default
};
