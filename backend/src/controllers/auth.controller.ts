import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../config/prisma";
import { loginSchema, registerSchema } from "../utils/validations";
import { AUTH_COOKIE_NAME, GOOGLE_OAUTH_STATE_COOKIE } from "../config/constants";
import { signJwtToken } from "../middleware/auth.middleware";
import {
  isGoogleAuthConfigured,
  getGoogleOAuthUrl,
  exchangeCodeForTokens,
  getGoogleUserProfile,
  generateOAuthState,
  getBaseUrl,
} from "../services/google-auth.service";

async function userHasActivePackage(userId: string): Promise<boolean> {
  const invitation = await prisma.invitation.findFirst({
    where: { userId },
    include: {
      paymentTransactions: {
        where: { paymentStatus: "SETTLEMENT" },
      },
    },
  });

  if (!invitation) return false;

  if (invitation.paymentTransactions && invitation.paymentTransactions.length > 0) {
    return true;
  }

  if (invitation.activeUntil && new Date(invitation.activeUntil) > new Date()) {
    return true;
  }

  return false;
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi gagal",
        details: parsed.error.format(),
      });
      return;
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
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

    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasActivePackage,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi gagal",
        details: parsed.error.format(),
      });
      return;
    }

    const regSetting = await prisma.systemSetting.findUnique({
      where: { key: "feature_registration" },
    });
    if (regSetting && regSetting.value === "false") {
      res.status(403).json({
        error: "Pendaftaran pengguna baru sementara ditutup untuk pemeliharaan sistem.",
      });
      return;
    }

    const { name, email, password, plan } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: "Email sudah terdaftar" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER",
        invitations: {
          create: {
            slug: `undangan-${Math.random().toString(36).substring(2, 8)}`,
            title: `Pernikahan ${name}`,
            themeId: "minimalist",
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
              greetingMessage:
                "Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Anda untuk menghadiri pernikahan kami.",
              stories: [],
              selectedTier: plan || null,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.json({ message: "Logout berhasil" });
}

export function googleAuthStatus(_req: Request, res: Response): void {
  res.json({ enabled: isGoogleAuthConfigured() });
}

export function googleAuth(req: Request, res: Response): void {
  if (!isGoogleAuthConfigured()) {
    res.redirect(`${getBaseUrl(req.headers.referer)}/login?error=google_not_configured`);
    return;
  }

  const rawFrom = req.query.from;
  const returnTarget =
    typeof rawFrom === "string" && rawFrom.startsWith("/") ? rawFrom : "/dashboard";

  const state = generateOAuthState();
  const statePayload = JSON.stringify({ state, returnTarget });

  res.cookie(GOOGLE_OAUTH_STATE_COOKIE, statePayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
    path: "/",
  });

  const googleUrl = getGoogleOAuthUrl(state, req.headers.referer);
  res.redirect(googleUrl);
}

export async function googleCallback(req: Request, res: Response): Promise<void> {
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;
  const errorParam = req.query.error as string | undefined;

  const frontendBase = getBaseUrl(req.headers.referer);

  const loginRedirect = (errorCode: string) => {
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

  let savedState: string | undefined;
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

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const fallbackPassword = crypto.randomBytes(32).toString("hex");
      const passwordHash = await bcrypt.hash(fallbackPassword, 10);

      user = await prisma.user.create({
        data: {
          email,
          name: profile.name || email.split("@")[0],
          passwordHash,
          role: "USER",
        },
      });
    }

    const hasActive = user.role === "ADMIN" ? true : await userHasActivePackage(user.id);

    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
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

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ user: null });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(401).json({ user: null });
      return;
    }

    const hasActivePackage = user.role === "ADMIN" ? true : await userHasActivePackage(user.id);

    res.json({
      user: {
        ...user,
        hasActivePackage,
      },
    });
  } catch (error) {
    next(error);
  }
}
