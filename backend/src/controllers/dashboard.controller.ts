import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import {
  invitationSchema,
  EventScheduleInput,
  GalleryItemInput,
  BankAccountInput,
} from "../utils/validations";
import { invalidateInvitationCache } from "../services/cache.service";

function generateSlugCode(name: string): string {
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${clean}-${randomSuffix}`;
}

export async function getDashboardInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;

    let invitation = await prisma.invitation.findFirst({
      where: { userId: user.userId },
      include: {
        eventSchedules: { orderBy: { date: "asc" } },
        galleries: { orderBy: { sortOrder: "asc" } },
        bankAccounts: true,
        paymentTransactions: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { tier: true, paymentStatus: true, amount: true, orderId: true },
        },
      },
    });

    if (!invitation) {
      invitation = await prisma.invitation.create({
        data: {
          slug: `undangan-${user.userId.slice(-6)}`,
          title: "Pernikahan Mempelai",
          userId: user.userId,
          themeId: "minimalist",
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
            greetingMessage:
              "Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Anda untuk menghadiri pernikahan kami.",
            stories: [],
            selectedTier: null,
          },
        },
        include: {
          eventSchedules: true,
          galleries: true,
          bankAccounts: true,
          paymentTransactions: true,
        },
      });
    }

    const settlementTx = invitation.paymentTransactions.find(
      (t) => t.paymentStatus === "SETTLEMENT"
    );
    const waitingTx = invitation.paymentTransactions.find(
      (t) => t.paymentStatus === "WAITING_VERIFICATION"
    );
    const pendingTx = invitation.paymentTransactions.find(
      (t) => t.paymentStatus === "PENDING"
    );

    const coupleInfo = (invitation.coupleInfo as Record<string, unknown>) || {};
    const selectedTier = (coupleInfo.selectedTier as string) || null;

    const hasActiveSubscription =
      Boolean(settlementTx) ||
      (Boolean(invitation.activeUntil) && new Date(invitation.activeUntil!) > new Date());

    if (user.role !== "ADMIN" && !hasActiveSubscription) {
      res.status(403).json({
        error: "NO_ACTIVE_PACKAGE",
        message: "Akun Anda belum memiliki paket undangan aktif. Silakan beli paket terlebih dahulu.",
      });
      return;
    }

    let currentTier: string | null = null;
    let isPaid = false;
    let paymentStatus: "SETTLEMENT" | "WAITING_VERIFICATION" | "PENDING" | "UNPAID" | "UNSELECTED" =
      "UNSELECTED";

    if (settlementTx) {
      currentTier = settlementTx.tier;
      isPaid = true;
      paymentStatus = "SETTLEMENT";
    } else if (invitation.activeUntil && new Date(invitation.activeUntil) > new Date()) {
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
    const musicUrl = (coupleInfo.musicUrl as string) || null;
    const youtubeVideoUrl = (coupleInfo.youtubeVideoUrl as string) || null;

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
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDashboardInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const body = req.body;

    const normalizedBody = {
      ...body,
      schedules: body.schedules || body.eventSchedules || [],
    };

    const parseResult = invitationSchema.safeParse(normalizedBody);
    if (!parseResult.success) {
      const fieldErrors = parseResult.error.flatten().fieldErrors;
      const errorList: string[] = [];
      for (const [field, msgs] of Object.entries(fieldErrors)) {
        if (msgs && msgs.length > 0) {
          errorList.push(`${field}: ${msgs.join(", ")}`);
        }
      }

      res.status(400).json({
        success: false,
        error:
          errorList.length > 0
            ? `Validasi gagal pada: ${errorList.join("; ")}`
            : "Validasi data gagal",
        details: parseResult.error.flatten(),
      });
      return;
    }

    const validData = parseResult.data;

    const userInv = await prisma.invitation.findFirst({
      where: { userId: user.userId },
      include: {
        paymentTransactions: {
          where: { paymentStatus: "SETTLEMENT" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { tier: true },
        },
      },
    });

    if (!userInv) {
      res.status(404).json({ success: false, error: "Undangan tidak ditemukan" });
      return;
    }

    const hasActiveSettlement =
      userInv.paymentTransactions && userInv.paymentTransactions.length > 0;
    const isAdmin = user.role === "ADMIN" || user.email === "admin@admin.com";

    if (!hasActiveSettlement && !isAdmin) {
      res.status(403).json({
        success: false,
        error:
          "Akun Anda belum memiliki paket aktif. Silakan pilih dan aktifkan paket di menu Langganan & Paket untuk mulai mengedit dan menyimpan undangan.",
      });
      return;
    }

    const currentTier = (userInv.paymentTransactions?.[0]?.tier as string) || "STARTER";

    if (currentTier === "STARTER" && !isAdmin) {
      const gNick = (validData.coupleInfo?.groomNickname || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      const bNick = (validData.coupleInfo?.brideNickname || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      if (gNick && bNick) {
        validData.slug = `${gNick}-${bNick}`;
      }
    }

    const existingSlug = await prisma.invitation.findFirst({
      where: {
        slug: validData.slug,
        userId: { not: user.userId },
      },
    });

    if (existingSlug) {
      res.status(409).json({
        success: false,
        error: "Subdomain / slug tautan ini sudah dipakai pasangan lain.",
      });
      return;
    }

    if (currentTier === "STARTER" && !isAdmin) {
      if (validData.galleries && validData.galleries.length > 10) {
        res.status(400).json({
          success: false,
          error:
            "Paket Starter mengizinkan maksimal 10 foto galeri. Silakan upgrade ke Paket Elegant untuk foto tanpa batas.",
        });
        return;
      }

      if (validData.bankAccounts && validData.bankAccounts.length > 2) {
        res.status(400).json({
          success: false,
          error:
            "Paket Starter mengizinkan maksimal 2 rekening bank. Silakan upgrade ke Paket Elegant untuk rekening tanpa batas.",
        });
        return;
      }

      if (
        validData.bankAccounts &&
        validData.bankAccounts.some((b) => b.qrisImageUrl && b.qrisImageUrl.trim() !== "")
      ) {
        res.status(400).json({
          success: false,
          error:
            "Paket Starter tidak mendukung foto QRIS. Silakan upgrade ke Paket Elegant atau Ultimate untuk menggunakan scan QRIS.",
        });
        return;
      }

      if (
        validData.coupleInfo?.stories &&
        validData.coupleInfo.stories.some((s) => s.imageUrl && s.imageUrl.trim() !== "")
      ) {
        res.status(400).json({
          success: false,
          error:
            "Paket Starter tidak mendukung upload foto pada Kisah Cinta. Silakan upgrade ke Paket Elegant atau Ultimate untuk menambahkan foto momen cinta.",
        });
        return;
      }

      if (validData.themeId && validData.themeId !== "minimalist") {
        res.status(400).json({
          success: false,
          error:
            "Paket Starter hanya dapat menggunakan 1 pilihan tema (Clean Minimalist). Silakan upgrade paket untuk membuka seluruh tema.",
        });
        return;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const coupleInfoData = {
        ...(validData.coupleInfo as object),
        musicUrl: validData.musicUrl || validData.coupleInfo.musicUrl || null,
        youtubeVideoUrl:
          validData.youtubeVideoUrl || validData.coupleInfo.youtubeVideoUrl || null,
      };

      const inv = await tx.invitation.update({
        where: { id: userInv.id },
        data: {
          title: validData.title,
          slug: validData.slug,
          themeId: validData.themeId,
          coupleInfo: coupleInfoData,
          isActive: validData.isActive,
          ...(validData.activeUntil ? { activeUntil: new Date(validData.activeUntil) } : {}),
        },
      });

      await tx.eventSchedule.deleteMany({ where: { invitationId: userInv.id } });
      if (validData.schedules && validData.schedules.length > 0) {
        await tx.eventSchedule.createMany({
          data: validData.schedules.map((s: EventScheduleInput) => ({
            invitationId: userInv.id,
            eventName: s.eventName,
            date: new Date(s.date),
            startTime: s.startTime,
            endTime: s.endTime || null,
            venueName: s.venueName,
            address: s.address,
            mapsUrl: s.mapsUrl || null,
            latitude: s.latitude || null,
            longitude: s.longitude || null,
          })),
        });
      }

      await tx.gallery.deleteMany({ where: { invitationId: userInv.id } });
      if (validData.galleries && validData.galleries.length > 0) {
        await tx.gallery.createMany({
          data: validData.galleries.map((g: GalleryItemInput, idx: number) => ({
            invitationId: userInv.id,
            imageUrl: g.imageUrl,
            caption: g.caption || null,
            sortOrder: g.sortOrder !== undefined ? g.sortOrder : idx,
          })),
        });
      }

      await tx.bankAccount.deleteMany({ where: { invitationId: userInv.id } });
      if (validData.bankAccounts && validData.bankAccounts.length > 0) {
        await tx.bankAccount.createMany({
          data: validData.bankAccounts.map((b: BankAccountInput) => ({
            invitationId: userInv.id,
            bankName: b.bankName,
            accountNumber: b.accountNumber,
            accountHolder: b.accountHolder,
            qrisImageUrl:
              currentTier === "STARTER" && !isAdmin ? null : b.qrisImageUrl || null,
          })),
        });
      }

      return inv;
    });

    invalidateInvitationCache(updated.slug, updated.id);
    if (userInv.slug !== updated.slug) {
      invalidateInvitationCache(userInv.slug, userInv.id);
    }

    res.json({
      success: true,
      message: "Data undangan berhasil disimpan",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function patchDashboardInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const body = req.body;

    const userInv = await prisma.invitation.findFirst({
      where: { userId: user.userId },
      include: {
        paymentTransactions: {
          where: { paymentStatus: "SETTLEMENT" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { tier: true },
        },
      },
    });

    if (!userInv) {
      res.status(404).json({ success: false, error: "Undangan tidak ditemukan" });
      return;
    }

    const currentTier = (userInv.paymentTransactions?.[0]?.tier as string) || "FREE";
    const updateData: Record<string, unknown> = {};

    if (body.selectedTier && ["STARTER", "ELEGANT", "ULTIMATE"].includes(body.selectedTier)) {
      const currentCouple = (userInv.coupleInfo as Record<string, unknown>) || {};
      updateData.coupleInfo = {
        ...currentCouple,
        selectedTier: body.selectedTier,
      };
    }

    if (body.themeId && typeof body.themeId === "string") {
      if (currentTier === "FREE" && body.themeId !== "minimalist") {
        res.status(400).json({
          success: false,
          error:
            "Tema ini khusus untuk paket berbayar. Silakan upgrade paket Anda untuk menggunakan tema ini.",
        });
        return;
      }
      updateData.themeId = body.themeId;
    }

    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive);
    }

    if (body.title && typeof body.title === "string") {
      updateData.title = body.title.trim();
    }

    if (body.slug && typeof body.slug === "string") {
      const cleanSlug = body.slug.toLowerCase().trim();
      const existingSlug = await prisma.invitation.findFirst({
        where: {
          slug: cleanSlug,
          userId: { not: user.userId },
        },
      });
      if (existingSlug) {
        res.status(409).json({
          success: false,
          error: "Subdomain tautan sudah digunakan pasangan lain",
        });
        return;
      }
      updateData.slug = cleanSlug;
    }

    const updated = await prisma.invitation.update({
      where: { id: userInv.id },
      data: updateData,
    });

    invalidateInvitationCache(updated.slug, updated.id);
    if (userInv.slug !== updated.slug) {
      invalidateInvitationCache(userInv.slug, userInv.id);
    }

    res.json({
      success: true,
      message: "Pengaturan berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function getGuests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;

    const invitation = await prisma.invitation.findFirst({
      where: { userId: user.userId },
      select: { id: true, slug: true },
    });

    if (!invitation) {
      res.json({ success: true, data: { guests: [], invitationSlug: "" } });
      return;
    }

    const guests = await prisma.guest.findMany({
      where: { invitationId: invitation.id },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: {
        guests,
        invitationSlug: invitation.slug,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function addGuest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;

    const invitation = await prisma.invitation.findFirst({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!invitation) {
      res.status(400).json({
        success: false,
        error: "Silakan buat draft undangan terlebih dahulu",
      });
      return;
    }

    const { guests, name, phoneNumber, quota } = req.body;

    if (name && typeof name === "string") {
      const newGuest = await prisma.guest.create({
        data: {
          invitationId: invitation.id,
          name: name.trim(),
          slugCode: generateSlugCode(name),
          phoneNumber: phoneNumber ? String(phoneNumber).trim() : null,
          quota: quota ? Number(quota) : 1,
        },
      });

      res.json({
        success: true,
        message: "Tamu berhasil ditambahkan",
        data: newGuest,
      });
      return;
    }

    if (Array.isArray(guests) && guests.length > 0) {
      const created = await Promise.all(
        guests.map(async (g) => {
          if (!g.name) return null;
          return prisma.guest.create({
            data: {
              invitationId: invitation.id,
              name: String(g.name).trim(),
              slugCode: generateSlugCode(String(g.name)),
              phoneNumber: g.phoneNumber ? String(g.phoneNumber).trim() : null,
              quota: g.quota ? Number(g.quota) : 1,
            },
          });
        })
      );

      const validCreated = created.filter(Boolean);
      res.json({
        success: true,
        message: `Berhasil menambahkan ${validCreated.length} tamu undangan`,
        data: validCreated,
      });
      return;
    }

    res.status(400).json({ success: false, error: "Data tamu tidak valid" });
  } catch (error) {
    next(error);
  }
}

export async function updateGuest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const { id, name, phoneNumber, quota } = req.body;

    if (!id || typeof id !== "string") {
      res.status(400).json({ success: false, error: "ID tamu wajib disertakan" });
      return;
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ success: false, error: "Nama tamu wajib diisi" });
      return;
    }

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: { invitation: { select: { userId: true } } },
    });

    if (!guest || guest.invitation.userId !== user.userId) {
      res.status(404).json({ success: false, error: "Tamu tidak ditemukan" });
      return;
    }

    const updated = await prisma.guest.update({
      where: { id },
      data: {
        name: name.trim(),
        phoneNumber: phoneNumber ? String(phoneNumber).trim() : null,
        quota: quota ? Math.max(1, Number(quota)) : 1,
      },
    });

    res.json({
      success: true,
      message: "Data tamu berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteGuest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const id = (req.query.id as string) || req.body?.id;

    if (!id) {
      res.status(400).json({ success: false, error: "id tamu wajib disertakan" });
      return;
    }

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: { invitation: { select: { userId: true } } },
    });

    if (!guest || guest.invitation.userId !== user.userId) {
      res.status(404).json({ success: false, error: "Tamu tidak ditemukan" });
      return;
    }

    await prisma.guest.delete({ where: { id } });

    res.json({ success: true, message: "Tamu berhasil dihapus" });
  } catch (error) {
    next(error);
  }
}

export async function getRsvpRecap(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;

    const invitation = await prisma.invitation.findFirst({
      where: { userId: user.userId },
      select: { id: true },
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
        },
      });
      return;
    }

    const rsvps = await prisma.rsvp.findMany({
      where: { invitationId: invitation.id },
      orderBy: { createdAt: "desc" },
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

    res.json({
      success: true,
      data: {
        totalResponses: rsvps.length,
        attendingCount,
        notAttendingCount,
        tentativeCount,
        totalPax,
        rsvps,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDashboardPayments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;

    const transactions = await prisma.paymentTransaction.findMany({
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
        createdAt: true,
      },
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
        createdAt: tx.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleGuestCheckin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const { id, action } = req.body;

    if (!id || typeof id !== "string") {
      res.status(400).json({ success: false, error: "ID tamu wajib disertakan" });
      return;
    }

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: { invitation: { select: { userId: true, id: true } } },
    });

    if (!guest || guest.invitation.userId !== user.userId) {
      res.status(404).json({ success: false, error: "Tamu tidak ditemukan" });
      return;
    }

    let newCheckedInAt: Date | null = null;
    if (action === "undo") {
      newCheckedInAt = null;
    } else if (action === "checkin") {
      newCheckedInAt = new Date();
    } else {
      newCheckedInAt = guest.checkedInAt ? null : new Date();
    }

    const updated = await prisma.guest.update({
      where: { id },
      data: { checkedInAt: newCheckedInAt },
    });

    res.json({
      success: true,
      message: updated.checkedInAt
        ? `Tamu "${updated.name}" (${updated.quota} Pax) berhasil check-in.`
        : `Check-in tamu "${updated.name}" berhasil dibatalkan.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function scanGuestQr(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const { qrData, guestId, slugCode } = req.body;

    const userInv = await prisma.invitation.findFirst({
      where: { userId: user.userId },
      select: { id: true, title: true, slug: true },
    });

    if (!userInv) {
      res.status(404).json({ success: false, error: "Undangan tidak ditemukan" });
      return;
    }

    let targetGuest = null;

    if (guestId) {
      targetGuest = await prisma.guest.findFirst({
        where: { id: guestId, invitationId: userInv.id },
      });
    } else if (slugCode) {
      targetGuest = await prisma.guest.findFirst({
        where: { slugCode, invitationId: userInv.id },
      });
    } else if (qrData && typeof qrData === "string") {
      const trimmed = qrData.trim();

      // 1. Coba parse JSON payload jika ada
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.guestId) {
          targetGuest = await prisma.guest.findFirst({
            where: { id: parsed.guestId, invitationId: userInv.id },
          });
        } else if (parsed.slugCode) {
          targetGuest = await prisma.guest.findFirst({
            where: { slugCode: parsed.slugCode, invitationId: userInv.id },
          });
        }
      } catch {
        // Bukan JSON, lanjutkan
      }

      // 2. Jika formatnya URL seperti ?to=... atau ?code=...
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
            invitationId: userInv.id,
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
        error: "Data tamu tidak ditemukan dalam daftar buku tamu acara ini.",
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

    // Statistik kehadiran terkini
    const allGuests = await prisma.guest.findMany({
      where: { invitationId: userInv.id },
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
        guest: updatedGuest,
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

export async function getGuestCheckinStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const invitation = await prisma.invitation.findFirst({
      where: { userId: user.userId },
      select: { id: true },
    });

    if (!invitation) {
      res.json({
        success: true,
        data: {
          totalGuests: 0,
          checkedInGuests: 0,
          totalPax: 0,
          checkedInPax: 0,
          recentCheckins: [],
        },
      });
      return;
    }

    const guests = await prisma.guest.findMany({
      where: { invitationId: invitation.id },
      orderBy: { checkedInAt: "desc" },
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
        recentCheckins,
      },
    });
  } catch (error) {
    next(error);
  }
}
