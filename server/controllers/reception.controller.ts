import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { signReceptionToken } from "../middleware/auth.middleware";

export async function verifyReceptionPin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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

    const invitation = await prisma.invitation.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        coupleInfo: true,
        isActive: true,
      },
    });

    if (!invitation || !invitation.isActive) {
      res.status(404).json({ success: false, error: "Undangan tidak ditemukan atau tidak aktif." });
      return;
    }

    const coupleInfo = (invitation.coupleInfo as Record<string, unknown>) || {};
    const expectedPin = String(coupleInfo.receptionPin || "123456").trim();

    if (pin.trim() !== expectedPin) {
      res.status(401).json({
        success: false,
        error: "PIN Meja Tamu salah. Silakan tanyakan kepada pengantin.",
      });
      return;
    }

    const token = signReceptionToken({
      role: "RECEPTIONIST",
      invitationId: invitation.id,
      slug: invitation.slug,
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
        coupleName: `${groom} & ${bride}`,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getReceptionStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reception = req.reception!;

    const [allGuests, recentGuests, invitation] = await Promise.all([
      prisma.guest.findMany({
        where: { invitationId: reception.invitationId },
        select: { quota: true, checkedInAt: true },
      }),
      prisma.guest.findMany({
        where: {
          invitationId: reception.invitationId,
          checkedInAt: { not: null },
        },
        orderBy: { checkedInAt: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          quota: true,
          checkedInAt: true,
        },
      }),
      prisma.invitation.findUnique({
        where: { id: reception.invitationId },
        select: { title: true, coupleInfo: true },
      }),
    ]);

    const coupleInfo = (invitation?.coupleInfo as Record<string, unknown>) || {};
    const groom = String(coupleInfo.groomNickname || coupleInfo.groomName || "");
    const bride = String(coupleInfo.brideNickname || coupleInfo.brideName || "");

    const totalGuests = allGuests.length;
    const checkedInGuests = allGuests.filter((g) => g.checkedInAt).length;
    const totalPax = allGuests.reduce((acc, g) => acc + (g.quota || 1), 0);
    const checkedInPax = allGuests
      .filter((g) => g.checkedInAt)
      .reduce((acc, g) => acc + (g.quota || 1), 0);

    res.json({
      success: true,
      data: {
        weddingTitle: invitation?.title || "Buku Tamu Resepsi",
        coupleName: groom && bride ? `${groom} & ${bride}` : "",
        stats: {
          totalGuests,
          checkedInGuests,
          totalPax,
          checkedInPax,
        },
        recentCheckins: recentGuests,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getReceptionGuests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reception = req.reception!;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    const guests = await prisma.guest.findMany({
      where: {
        invitationId: reception.invitationId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { phoneNumber: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: [{ checkedInAt: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slugCode: true,
        quota: true,
        phoneNumber: true,
        checkedInAt: true,
      },
    });

    res.json({
      success: true,
      data: guests,
    });
  } catch (error) {
    next(error);
  }
}

export async function scanReceptionGuest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reception = req.reception!;
    const { qrData, guestId, slugCode } = req.body;

    let targetGuest = null;

    if (guestId) {
      targetGuest = await prisma.guest.findFirst({
        where: { id: guestId, invitationId: reception.invitationId },
      });
    } else if (slugCode) {
      targetGuest = await prisma.guest.findFirst({
        where: { slugCode, invitationId: reception.invitationId },
      });
    } else if (qrData && typeof qrData === "string") {
      const trimmed = qrData.trim();

      // 1. Coba parse JSON payload jika ada
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.guestId) {
          targetGuest = await prisma.guest.findFirst({
            where: { id: parsed.guestId, invitationId: reception.invitationId },
          });
        } else if (parsed.slugCode) {
          targetGuest = await prisma.guest.findFirst({
            where: { slugCode: parsed.slugCode, invitationId: reception.invitationId },
          });
        }
      } catch {
        // Bukan JSON, abaikan
      }

      // 2. Format URL seperti ?to=... atau ?code=...
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
            // URL parse fallback
          }
        }

        targetGuest = await prisma.guest.findFirst({
          where: {
            invitationId: reception.invitationId,
            OR: [
              { id: extractedCodeOrName },
              { slugCode: extractedCodeOrName },
              { name: { equals: extractedCodeOrName, mode: "insensitive" } },
            ],
          },
        });
      }
    }

    if (!targetGuest) {
      res.status(404).json({
        success: false,
        error: "Data tamu tidak ditemukan dalam daftar undangan acara ini.",
      });
      return;
    }

    const isAlreadyCheckedIn = Boolean(targetGuest.checkedInAt);
    let updatedGuest = targetGuest;

    if (!isAlreadyCheckedIn) {
      updatedGuest = await prisma.guest.update({
        where: { id: targetGuest.id },
        data: { checkedInAt: new Date() },
      });
    }

    // Hitung statistik kehadiran terkini
    const allGuests = await prisma.guest.findMany({
      where: { invitationId: reception.invitationId },
      select: { quota: true, checkedInAt: true },
    });

    const totalGuests = allGuests.length;
    const checkedInGuests = allGuests.filter((g) => g.checkedInAt).length;
    const totalPax = allGuests.reduce((acc, g) => acc + (g.quota || 1), 0);
    const checkedInPax = allGuests
      .filter((g) => g.checkedInAt)
      .reduce((acc, g) => acc + (g.quota || 1), 0);

    res.json({
      success: true,
      status: isAlreadyCheckedIn ? "ALREADY_CHECKED_IN" : "CHECKIN_SUCCESS",
      message: isAlreadyCheckedIn
        ? `Tamu "${targetGuest.name}" SUDAH check-in sebelumnya pada ${new Date(
            targetGuest.checkedInAt!
          ).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB.`
        : `Tamu "${targetGuest.name}" (${targetGuest.quota} Pax) berhasil check-in!`,
      data: {
        guest: {
          id: updatedGuest.id,
          name: updatedGuest.name,
          slugCode: updatedGuest.slugCode,
          quota: updatedGuest.quota,
          phoneNumber: updatedGuest.phoneNumber,
          checkedInAt: updatedGuest.checkedInAt,
        },
        stats: {
          totalGuests,
          checkedInGuests,
          totalPax,
          checkedInPax,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleReceptionCheckin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const reception = req.reception!;
    const rawGuestId = req.params.guestId;
    const guestId = Array.isArray(rawGuestId) ? rawGuestId[0] : rawGuestId;
    const { checkedIn } = req.body;

    if (!guestId || typeof guestId !== "string") {
      res.status(400).json({ success: false, error: "ID Tamu tidak valid." });
      return;
    }

    const guest = await prisma.guest.findFirst({
      where: { id: guestId, invitationId: reception.invitationId },
    });

    if (!guest) {
      res.status(404).json({ success: false, error: "Tamu tidak ditemukan." });
      return;
    }

    const updated = await prisma.guest.update({
      where: { id: guestId },
      data: { checkedInAt: checkedIn ? new Date() : null },
      select: {
        id: true,
        name: true,
        slugCode: true,
        quota: true,
        phoneNumber: true,
        checkedInAt: true,
      },
    });

    res.json({
      success: true,
      message: checkedIn
        ? `Tamu "${updated.name}" (${updated.quota} Pax) berhasil check-in.`
        : `Check-in tamu "${updated.name}" berhasil dibatalkan.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
