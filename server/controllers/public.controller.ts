import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import prisma from "../config/prisma";
import { rsvpSchema, wishSchema } from "../utils/validations";

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}
import { KNOWN_DEMO_SLUGS } from "../config/constants";
import {
  getCachedPublicInvitation,
  getInvitationMeta,
  invalidateInvitationCache,
} from "../services/cache.service";
import { getPublicSettingsMap } from "../services/settings.service";

const INITIAL_DEMO_WISHES = [
  {
    id: "demo-w-1",
    senderName: "Budi & Ani Santoso",
    message: "Barakallahu lakum wa baraka alaikum. Selamat menempuh hidup baru untuk kedua mempelai!",
    reaction: "💖",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "demo-w-2",
    senderName: "Keluarga Besar Bpk. Hendra",
    message: "Semoga menjadi keluarga yang sakinah, mawaddah, dan warahmah. Bahagia selalu selamanya.",
    reaction: "🤲",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "demo-w-3",
    senderName: "Dinda & Sahabat Kampus",
    message: "Selamat yaa! Senang sekali melihat kalian berdua bersanding di pelaminan. Lancar sampai hari H!",
    reaction: "✨",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export async function getPublicInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawSlug = req.params.slug;
    const slug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug) || "";
    if (!slug) {
      res.status(400).json({ error: "Slug wajib disertakan" });
      return;
    }

    const [invitation, publicSettings] = await Promise.all([
      getCachedPublicInvitation(slug),
      getPublicSettingsMap(),
    ]);

    if (!invitation) {
      res.status(404).json({ error: "Undangan tidak ditemukan atau sedang tidak aktif" });
      return;
    }

    res.json({ data: { ...invitation, systemSettings: publicSettings } });
  } catch (error) {
    next(error);
  }
}

export async function submitRsvp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = rsvpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi formulir RSVP gagal",
        details: parsed.error.format(),
      });
      return;
    }

    const { invitationId, guestName, status, attendeeCount, sessionChosen } = parsed.data;

    // Handle known demo slugs gracefully
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
          createdAt: new Date().toISOString(),
        },
      });
      return;
    }

    const invitation = await getInvitationMeta(invitationId);
    if (!invitation || !invitation.isActive) {
      res.status(404).json({
        error: "Undangan tidak ditemukan atau sedang dinonaktifkan oleh pemilik",
      });
      return;
    }

    const cleanGuestName = stripHtml(guestName);

    const rsvp = await prisma.rsvp.create({
      data: {
        invitationId: invitation.id,
        guestName: cleanGuestName,
        status,
        attendeeCount: attendeeCount ?? 1,
        sessionChosen: sessionChosen || null,
      },
    });

    invalidateInvitationCache(invitationId, invitation.id);

    res.status(201).json({
      message: "Konfirmasi kehadiran berhasil disimpan",
      data: rsvp,
    });
  } catch (error) {
    next(error);
  }
}

export async function getWishes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const invitationId = req.query.invitationId as string | undefined;
    const limit = Math.min(parseInt((req.query.limit as string) || "20", 10), 50);
    const cursor = req.query.cursor as string | undefined;

    if (!invitationId) {
      res.status(400).json({ error: "Parameter invitationId wajib disertakan" });
      return;
    }

    if (KNOWN_DEMO_SLUGS.includes(invitationId)) {
      res.json({
        wishes: INITIAL_DEMO_WISHES,
        nextCursor: null,
      });
      return;
    }

    const invitation = await getInvitationMeta(invitationId);
    if (!invitation) {
      res.json({ wishes: [], nextCursor: null });
      return;
    }

    const wishes = await prisma.wish.findMany({
      where: {
        invitationId: invitation.id,
        isHidden: false,
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        senderName: true,
        message: true,
        reaction: true,
        createdAt: true,
      },
    });

    let nextCursor: string | null = null;
    if (wishes.length > limit) {
      const nextItem = wishes.pop();
      nextCursor = nextItem?.id || null;
    }

    res.json({ wishes, nextCursor });
  } catch (error) {
    next(error);
  }
}

export async function submitWish(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = wishSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi ucapan gagal",
        details: parsed.error.format(),
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
          createdAt: new Date().toISOString(),
        },
      });
      return;
    }

    const invitation = await getInvitationMeta(invitationId);
    if (!invitation || !invitation.isActive) {
      res.status(404).json({
        error: "Undangan tidak ditemukan atau sedang dinonaktifkan oleh pemilik",
      });
      return;
    }

    const wish = await prisma.wish.create({
      data: {
        invitationId: invitation.id,
        senderName: cleanSenderName,
        message: cleanMessage,
        reaction: reaction || null,
      },
      select: {
        id: true,
        senderName: true,
        message: true,
        reaction: true,
        createdAt: true,
      },
    });

    invalidateInvitationCache(invitationId, invitation.id);

    res.status(201).json({
      message: "Doa dan ucapan berhasil dikirim",
      data: wish,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicSystemSettings(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const settings = await getPublicSettingsMap();
    res.json({
      success: true,
      data: settings,
      ...settings,
    });
  } catch (error) {
    next(error);
  }
}

export async function downloadPublicFile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawUrl = req.query.url as string;
    const requestedName = (req.query.filename as string) || "downloaded-file";

    if (!rawUrl || typeof rawUrl !== "string") {
      res.status(400).json({ error: "Parameter url wajib disertakan" });
      return;
    }

    const cleanFilename =
      requestedName.replace(/[^\w\s.-]/g, "").trim().replace(/\s+/g, "_") || "qris-download.jpg";

    // 1. If relative URL starting with /uploads/
    if (rawUrl.startsWith("/uploads/")) {
      const safeRelative = path
        .normalize(rawUrl.replace(/^\/uploads\//, ""))
        .replace(/^(\.\.[\/\\])+/, "");
      const fullPath = path.join(process.cwd(), "public", "uploads", safeRelative);
      if (fs.existsSync(fullPath)) {
        res.download(fullPath, cleanFilename);
        return;
      }
    }

    // 2. If remote HTTP / HTTPS URL (fetch and stream with attachment headers to avoid CORS)
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

const DUMMY_NAME_PATTERNS = new Set([
  "pria",
  "wanita",
  "test",
  "test1",
  "test2",
  "pasangan baru",
  "nama pengantin",
  "nama mempelai",
  "dummy",
  "sample",
]);

const DUMMY_VENUE_PATTERNS = new Set([
  "lokasi pernikahan",
  "nama tempat & kota",
  "nama tempat",
  "venue",
  "lokasi acara",
  "gedung serbaguna",
  "alamat venue",
]);

interface CoupleInfoPayload {
  groomName?: string;
  groomNickname?: string;
  brideName?: string;
  brideNickname?: string;
  groomPhoto?: string;
  bridePhoto?: string;
  desktopCoverImage?: string;
  [key: string]: unknown;
}

interface ShowcaseCandidateSchedule {
  id: string;
  eventName: string;
  date: Date;
  venueName: string;
  address: string;
}

interface ShowcaseCandidateGallery {
  imageUrl: string;
}

interface ShowcaseCandidateGuest {
  id: string;
  checkedInAt: Date | null;
}

interface ShowcaseCandidateInvitation {
  id: string;
  slug: string;
  title: string;
  themeId: string;
  coupleInfo: unknown;
  eventSchedules: ShowcaseCandidateSchedule[];
  galleries: ShowcaseCandidateGallery[];
  guests: ShowcaseCandidateGuest[];
  _count: {
    wishes: number;
    rsvps: number;
  };
}

export interface ShowcaseItemResponse {
  couple: string;
  date: string;
  venue: string;
  theme: string;
  img: string;
  slug: string;
}

function extractValidShowcaseItem(
  inv: ShowcaseCandidateInvitation,
  now: Date
): ShowcaseItemResponse | null {
  // 1. Validasi Jadwal Acara & Status Selesai
  if (!inv.eventSchedules || inv.eventSchedules.length === 0) {
    return null;
  }

  // Acara harus sudah selesai (lewat Hari H)
  const latestScheduleTime = Math.max(
    ...inv.eventSchedules.map((s) => new Date(s.date).getTime())
  );
  if (latestScheduleTime > now.getTime()) {
    return null;
  }

  const primarySchedule = inv.eventSchedules[0];
  const venueTrimmed = (primarySchedule.venueName || "").trim().toLowerCase();
  if (
    !venueTrimmed ||
    venueTrimmed.length < 3 ||
    DUMMY_VENUE_PATTERNS.has(venueTrimmed)
  ) {
    return null;
  }

  // 2. Validasi Kelengkapan Mempelai (Couple Info)
  const info = (inv.coupleInfo as CoupleInfoPayload) || {};
  const groomNick = (info.groomNickname || "").trim();
  const brideNick = (info.brideNickname || "").trim();

  if (!groomNick || !brideNick) {
    return null;
  }

  const groomLower = groomNick.toLowerCase();
  const brideLower = brideNick.toLowerCase();

  if (
    DUMMY_NAME_PATTERNS.has(groomLower) ||
    DUMMY_NAME_PATTERNS.has(brideLower) ||
    groomLower === brideLower
  ) {
    return null;
  }

  // 3. Validasi Foto Nyata (Bukan placeholder default template)
  const galleryImg = inv.galleries[0]?.imageUrl?.trim() || "";
  const photoCandidate =
    galleryImg ||
    (typeof info.groomPhoto === "string" ? info.groomPhoto.trim() : "") ||
    (typeof info.bridePhoto === "string" ? info.bridePhoto.trim() : "") ||
    (typeof info.desktopCoverImage === "string" ? info.desktopCoverImage.trim() : "");

  if (
    !photoCandidate ||
    photoCandidate.includes("couple-center.jpg") ||
    photoCandidate.startsWith("/templates/")
  ) {
    return null;
  }

  // 4. Validasi Digunakan pada Hari H (Check-in tamu ATAU interaksi ucapan/RSVP)
  const hasCheckedIn = inv.guests.some((g) => g.checkedInAt !== null);
  const hasWishes = (inv._count?.wishes || 0) > 0;
  const hasRsvps = (inv._count?.rsvps || 0) > 0;

  if (!hasCheckedIn && !hasWishes && !hasRsvps) {
    return null;
  }

  const dateStr = new Date(primarySchedule.date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return {
    couple: `${groomNick} & ${brideNick}`,
    date: dateStr,
    venue: primarySchedule.venueName.trim(),
    theme: inv.themeId || "Botanical",
    img: photoCandidate,
    slug: inv.slug,
  };
}

export async function getPublicShowcase(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const now = new Date();

    const candidates = await prisma.invitation.findMany({
      where: {
        isActive: true,
        NOT: {
          slug: {
            startsWith: "demo-",
          },
        },
        eventSchedules: {
          some: {
            date: { lte: now },
          },
        },
        OR: [
          { guests: { some: { checkedInAt: { not: null } } } },
          { wishes: { some: {} } },
          { rsvps: { some: {} } },
        ],
      },
      take: 24,
      orderBy: { createdAt: "desc" },
      include: {
        eventSchedules: { orderBy: { date: "asc" } },
        galleries: { take: 1, orderBy: { sortOrder: "asc" } },
        guests: {
          where: { checkedInAt: { not: null } },
          take: 1,
          select: { id: true, checkedInAt: true },
        },
        _count: {
          select: {
            wishes: true,
            rsvps: true,
          },
        },
      },
    });

    const items: ShowcaseItemResponse[] = [];
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
      data: items,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicTestimonials(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "user_testimonials_json" },
    });
    let list: any[] = [];
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
      data: list,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mengambil data statistik penggunaan tema terlaris.
 * Dihitung HANYA pada undangan yang telah mencapai/melewati Hari H acara pernikahan (date <= now),
 * sehingga pergantian tema sementara oleh pengguna di dashboard tidak terhitung.
 */
export async function getPublicThemeStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const now = new Date();

    // Query undangan aktif yang telah mencapai/melewati Hari H (memiliki jadwal acara dengan date <= now)
    const maturedInvitations = await prisma.invitation.findMany({
      where: {
        isActive: true,
        eventSchedules: {
          some: {
            date: { lte: now },
          },
        },
      },
      select: {
        themeId: true,
      },
    });

    const usageCounts: Record<string, number> = {};
    for (const inv of maturedInvitations) {
      if (inv.themeId) {
        usageCounts[inv.themeId] = (usageCounts[inv.themeId] || 0) + 1;
      }
    }

    res.json({
      success: true,
      data: usageCounts,
    });
  } catch (error) {
    next(error);
  }
}

