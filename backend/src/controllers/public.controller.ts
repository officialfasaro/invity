import { Request, Response, NextFunction } from "express";
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

    const invitation = await getCachedPublicInvitation(slug);
    if (!invitation) {
      res.status(404).json({ error: "Undangan tidak ditemukan atau sedang tidak aktif" });
      return;
    }

    res.json({ data: invitation });
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
    res.json(settings);
  } catch (error) {
    next(error);
  }
}
