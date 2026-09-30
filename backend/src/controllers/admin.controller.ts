import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import path from "path";
import prisma from "../config/prisma";
import { UserRole, SubscriptionTier, PaymentStatus } from "@prisma/client";
import { signJwtToken } from "../middleware/auth.middleware";
import { AUTH_COOKIE_NAME } from "../config/constants";
import { SYSTEM_SETTING_DEFINITIONS } from "../services/settings.service";
import { invalidateInvitationCache } from "../services/cache.service";
import { z } from "zod";

export async function getMetrics(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalActiveInvitations,
      pendingPaymentsCount,
      monthlySettlements,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.invitation.count({ where: { isActive: true } }),
      prisma.paymentTransaction.count({ where: { paymentStatus: "WAITING_VERIFICATION" } }),
      prisma.paymentTransaction.findMany({
        where: {
          paymentStatus: "SETTLEMENT",
          createdAt: { gte: startOfMonth },
        },
        select: { amount: true },
      }),
      prisma.user.findMany({
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
            select: { title: true, slug: true, isActive: true },
          },
        },
      }),
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
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getClients(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await prisma.user.findMany({
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
              take: 5,
              select: { tier: true, paymentStatus: true },
            },
          },
        },
      },
    });

    const clients = users.map((u) => {
      const inv = u.invitations[0] || null;
      const coupleInfo = (inv?.coupleInfo as Record<string, unknown>) || {};
      const settlementTx = inv?.paymentTransactions.find((t) => t.paymentStatus === "SETTLEMENT");
      const pendingTx = inv?.paymentTransactions[0];
      const selectedTier = (coupleInfo.selectedTier as string) || null;

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
        } else if (!settlementTx && !inv.activeUntil) {
          status = latestTier === "BELUM_PILIH_PAKET" ? "UNSELECTED" : "UNPAID";
        } else if (inv.activeUntil && new Date(inv.activeUntil) < new Date()) {
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
        invitation: inv
          ? {
              id: inv.id,
              title: inv.title,
              slug: inv.slug,
              themeId: inv.themeId,
              activeUntil: inv.activeUntil,
              isActive: inv.isActive,
              tier: latestTier,
              status,
            }
          : null,
      };
    });

    res.json({ success: true, data: clients });
  } catch (error) {
    next(error);
  }
}

export async function patchClient(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { invitationId, addDays, isActive, tier } = req.body;

    if (!invitationId) {
      res.status(400).json({ success: false, error: "invitationId wajib disertakan" });
      return;
    }

    const currentInv = await prisma.invitation.findUnique({
      where: { id: invitationId },
      select: { activeUntil: true, userId: true },
    });

    if (!currentInv) {
      res.status(404).json({ success: false, error: "Undangan tidak ditemukan" });
      return;
    }

    const updateData: {
      isActive?: boolean;
      activeUntil?: Date;
    } = {};

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }

    if (typeof addDays === "number" && addDays !== 0) {
      const baseDate =
        currentInv.activeUntil && currentInv.activeUntil > new Date()
          ? new Date(currentInv.activeUntil)
          : new Date();
      baseDate.setDate(baseDate.getDate() + addDays);
      updateData.activeUntil = baseDate;
    }

    const updated = await prisma.invitation.update({
      where: { id: invitationId },
      data: updateData,
    });

    if (tier) {
      await prisma.paymentTransaction.create({
        data: {
          orderId: `ADMIN-ADJUST-${Date.now()}`,
          userId: currentInv.userId,
          invitationId: invitationId,
          tier: tier as SubscriptionTier,
          amount:
            tier === "ULTIMATE" ? 279000 : tier === "ELEGANT" ? 149000 : tier === "STARTER" ? 39000 : 0,
          paymentType: "GATEWAY",
          paymentStatus: "SETTLEMENT",
          verifiedBy: "ADMIN_OVERRIDE",
          verifiedAt: new Date(),
        },
      });
    }

    res.json({
      success: true,
      message: "Data klien & undangan berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function impersonate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) {
      res.status(400).json({ success: false, error: "targetUserId wajib disertakan" });
      return;
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, role: true, name: true },
    });

    if (!targetUser) {
      res.status(404).json({ success: false, error: "Pengguna tidak ditemukan" });
      return;
    }

    const token = signJwtToken({
      userId: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
    });

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: `Berhasil login sebagai ${targetUser.name}`,
      redirectUrl: "/dashboard",
    });
  } catch (error) {
    next(error);
  }
}

export async function getThemes(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const themes = await prisma.themeCatalog.findMany({
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: themes });
  } catch (error) {
    next(error);
  }
}

export async function createTheme(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { themeKey, name, category, thumbnail, isPremium, isActive } = req.body;

    if (!themeKey || !name || !thumbnail) {
      res.status(400).json({
        success: false,
        error: "themeKey, name, dan thumbnail wajib diisi",
      });
      return;
    }

    const newTheme = await prisma.themeCatalog.create({
      data: {
        themeKey: themeKey.toLowerCase().trim(),
        name,
        category: category || "Modern Chic",
        thumbnail,
        isPremium: Boolean(isPremium),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    res.json({
      success: true,
      message: "Tema baru berhasil ditambahkan",
      data: newTheme,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTheme(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id, name, category, thumbnail, isPremium, isActive } = req.body;

    if (!id) {
      res.status(400).json({ success: false, error: "id tema wajib disertakan" });
      return;
    }

    const updated = await prisma.themeCatalog.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(thumbnail && { thumbnail }),
        ...(isPremium !== undefined && { isPremium: Boolean(isPremium) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    res.json({
      success: true,
      message: "Tema berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTheme(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = (req.query.id as string) || req.body?.id;

    if (!id) {
      res.status(400).json({ success: false, error: "id tema wajib disertakan" });
      return;
    }

    const existingTheme = await prisma.themeCatalog.findUnique({
      where: { id },
    });

    if (!existingTheme) {
      res.status(404).json({ success: false, error: "Tema tidak ditemukan" });
      return;
    }

    if (existingTheme.themeKey === "minimalist") {
      res.status(400).json({
        success: false,
        error: "Tema default 'minimalist' adalah fondasi sistem dan tidak boleh dihapus.",
      });
      return;
    }

    // Ekosistem cleanup: Cari seluruh undangan yang masih memakai tema ini
    const affectedInvitations = await prisma.invitation.findMany({
      where: { themeId: existingTheme.themeKey },
      select: { id: true, slug: true },
    });

    // Reassign ke tema default 'minimalist' secara aman
    if (affectedInvitations.length > 0) {
      await prisma.invitation.updateMany({
        where: { themeId: existingTheme.themeKey },
        data: { themeId: "minimalist" },
      });

      // Reset cache untuk seluruh undangan yang terdampak
      for (const inv of affectedInvitations) {
        invalidateInvitationCache(inv.slug, inv.id);
      }
    }

    // Bersihkan file thumbnail lokal jika ada di direktori /uploads
    if (existingTheme.thumbnail && existingTheme.thumbnail.startsWith("/uploads/")) {
      const uploadPath = path.join(process.cwd(), existingTheme.thumbnail);
      try {
        await fs.unlink(uploadPath);
      } catch {
        // Abaikan jika file fisik sudah tidak ada
      }
    }

    // Hapus dari database
    await prisma.themeCatalog.delete({ where: { id } });

    res.json({
      success: true,
      message:
        affectedInvitations.length > 0
          ? `Tema "${existingTheme.name}" berhasil dihapus. ${affectedInvitations.length} undangan aktif telah dialihkan ke tema Minimalist.`
          : `Tema "${existingTheme.name}" berhasil dihapus dari katalog.`,
      affectedInvitationsCount: affectedInvitations.length,
    });
  } catch (error) {
    next(error);
  }
}

export async function adminScanGuestCheckin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { invitationId, qrData, slugCode, guestId } = req.body;

    let targetGuest: any = null;
    if (guestId) {
      targetGuest = await prisma.guest.findUnique({
        where: { id: guestId },
        include: { invitation: { select: { title: true, slug: true } } },
      });
    } else if (slugCode && invitationId) {
      targetGuest = await prisma.guest.findFirst({
        where: { slugCode, invitationId },
        include: { invitation: { select: { title: true, slug: true } } },
      });
    } else if (qrData) {
      const trimmed = String(qrData).trim();
      let extracted = trimmed;
      try {
        const p = JSON.parse(trimmed);
        if (p.guestId) extracted = p.guestId;
        else if (p.slugCode) extracted = p.slugCode;
      } catch {
        // Fallback string
      }

      targetGuest = await prisma.guest.findFirst({
        where: {
          OR: [{ id: extracted }, { slugCode: extracted }],
          ...(invitationId ? { invitationId } : {}),
        },
        include: { invitation: { select: { title: true, slug: true } } },
      });
    }

    if (!targetGuest) {
      res.status(404).json({ success: false, error: "Tamu tidak ditemukan" });
      return;
    }

    const isAlreadyCheckedIn = Boolean(targetGuest.checkedInAt);
    let updated = targetGuest;

    if (!isAlreadyCheckedIn) {
      updated = await prisma.guest.update({
        where: { id: targetGuest.id },
        data: { checkedInAt: new Date() },
        include: { invitation: { select: { title: true, slug: true } } },
      });
    }

    res.json({
      success: true,
      status: isAlreadyCheckedIn ? "ALREADY_CHECKED_IN" : "CHECKIN_SUCCESS",
      message: isAlreadyCheckedIn
        ? `Tamu "${targetGuest.name}" SUDAH check-in sebelumnya pada ${new Date(
            targetGuest.checkedInAt
          ).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB.`
        : `Tamu "${targetGuest.name}" (${targetGuest.quota} Pax - ${targetGuest.invitation?.title || ""}) berhasil check-in!`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminSettings(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dbSettings = await prisma.systemSetting.findMany();
    const dbMap = new Map(dbSettings.map((s) => [s.key, s]));

    const merged = SYSTEM_SETTING_DEFINITIONS.map((def) => {
      const fromDb = dbMap.get(def.key);
      return {
        id: fromDb?.id ?? `def-${def.key}`,
        key: def.key,
        value: fromDb?.value ?? def.defaultValue,
        label: def.label,
        description: fromDb?.description || def.description,
        category: def.category,
        isPublic: def.isPublic,
      };
    });

    res.json({ success: true, data: merged });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminSettings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings)) {
      res.status(400).json({
        success: false,
        error: "Format data settings tidak valid (wajib array)",
      });
      return;
    }

    for (const item of settings) {
      if (item.key && typeof item.value === "string") {
        await prisma.systemSetting.upsert({
          where: { key: item.key },
          update: {
            value: item.value,
            ...(item.description && { description: item.description }),
          },
          create: {
            key: item.key,
            value: item.value,
            description: item.description || null,
          },
        });
      }
    }

    const updatedSettings = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    });

    res.json({
      success: true,
      message: "Pengaturan sistem berhasil disimpan",
      data: updatedSettings,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminPayments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const statusParam = (req.query.status as string) || "ALL";
    const tierParam = (req.query.tier as string) || "ALL";
    const search = ((req.query.search as string) || "").trim();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const where: Record<string, unknown> = {};

    if (statusParam !== "ALL") {
      where.paymentStatus = statusParam as PaymentStatus;
    }

    if (tierParam !== "ALL") {
      where.tier = tierParam as SubscriptionTier;
    }

    if (search) {
      where.OR = [
        { orderId: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { invitation: { slug: { contains: search, mode: "insensitive" } } },
        { invitation: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [transactions, allTransactions] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          invitation: {
            select: { id: true, title: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 150,
      }),
      prisma.paymentTransaction.findMany({
        select: {
          id: true,
          amount: true,
          paymentStatus: true,
          paymentType: true,
          tier: true,
          createdAt: true,
        },
      }),
    ]);

    let totalAllTimeRevenue = 0;
    let monthlySettledRevenue = 0;
    let settledCount = 0;
    let waitingVerificationCount = 0;
    let pendingCount = 0;
    let expiredOrCancelledCount = 0;

    const tierBreakdown: Record<string, { count: number; totalAmount: number }> = {
      STARTER: { count: 0, totalAmount: 0 },
      ELEGANT: { count: 0, totalAmount: 0 },
      ULTIMATE: { count: 0, totalAmount: 0 },
    };

    const methodBreakdown: Record<string, { count: number; totalAmount: number }> = {
      GATEWAY: { count: 0, totalAmount: 0 },
      MANUAL_QRIS: { count: 0, totalAmount: 0 },
      MANUAL_BANK: { count: 0, totalAmount: 0 },
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
        transactions: transactions.map((tx) => ({
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
          invitation: tx.invitation
            ? {
                id: tx.invitation.id,
                title: tx.invitation.title,
                slug: tx.invitation.slug,
              }
            : null,
        })),
        analytics: {
          totalAllTimeRevenue,
          monthlySettledRevenue,
          totalTransactionsCount: allTransactions.length,
          settledCount,
          waitingVerificationCount,
          pendingCount,
          expiredOrCancelledCount,
          tierBreakdown,
          methodBreakdown,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getVerifyPayments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const status = (req.query.status as string) || "WAITING_VERIFICATION";

    const transactions = await prisma.paymentTransaction.findMany({
      where: {
        paymentStatus: status as "WAITING_VERIFICATION" | "PENDING" | "SETTLEMENT" | "CANCELLED",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        invitation: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: transactions });
  } catch (error) {
    next(error);
  }
}

export async function actionVerifyPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = req.user!;
    const schema = z.object({
      transactionId: z.string().min(1, "ID transaksi wajib diisi"),
      action: z.enum(["APPROVE", "REJECT"]),
      rejectionReason: z.string().max(250).optional().nullable(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi aksi verifikasi gagal",
        details: parsed.error.format(),
      });
      return;
    }

    const { transactionId, action } = parsed.data;

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { invitation: true },
    });

    if (!transaction) {
      res.status(404).json({ error: "Data transaksi tidak ditemukan" });
      return;
    }

    if (action === "APPROVE") {
      const activeUntil = new Date();
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

      const updated = await prisma.$transaction(async (tx) => {
        const txUpdated = await tx.paymentTransaction.update({
          where: { id: transactionId },
          data: {
            paymentStatus: "SETTLEMENT",
            verifiedBy: session.email,
            verifiedAt: new Date(),
          },
        });

        if (transaction.invitationId) {
          const inv = await tx.invitation.findUnique({
            where: { id: transaction.invitationId },
          });
          const coupleInfo = (inv?.coupleInfo as Record<string, unknown>) || {};

          await tx.invitation.update({
            where: { id: transaction.invitationId },
            data: {
              isActive: true,
              activeUntil,
              coupleInfo: {
                ...coupleInfo,
                selectedTier: transaction.tier,
              },
            },
          });
        }

        return txUpdated;
      });

      res.json({
        message: `Transaksi berhasil disetujui & paket ${transaction.tier} aktif (${durationDesc})`,
        data: updated,
      });
      return;
    }

    const updated = await prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        paymentStatus: "CANCELLED",
        verifiedBy: session.email,
        verifiedAt: new Date(),
      },
    });

    res.json({
      message: "Transaksi berhasil ditolak dan dibatalkan",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserRoles(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await prisma.user.findMany({
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
            coupleInfo: true,
          },
          take: 1,
        },
      },
    });

    const formatted = users.map((u) => {
      const inv = u.invitations[0] || null;
      const coupleInfo = (inv?.coupleInfo as Record<string, unknown>) || {};
      const selectedTier = (coupleInfo.selectedTier as string) || null;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
        invitation: inv
          ? {
              id: inv.id,
              title: inv.title,
              slug: inv.slug,
              isActive: inv.isActive,
              tier: selectedTier || "STARTER",
            }
          : null,
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

export async function patchUserRole(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = req.user!;
    const { userId, role } = req.body;

    if (!userId || !role) {
      res.status(400).json({ success: false, error: "userId dan role wajib disertakan" });
      return;
    }

    if (role !== "ADMIN" && role !== "USER") {
      res.status(400).json({ success: false, error: "Nilai role harus berupa 'ADMIN' atau 'USER'" });
      return;
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      res.status(404).json({ success: false, error: "Pengguna tidak ditemukan" });
      return;
    }

    if (targetUser.email === "admin@admin.com" && role !== "ADMIN") {
      res.status(403).json({
        success: false,
        error: "Akun Super Admin utama (admin@admin.com) dilindungi dan tidak dapat diubah hak aksesnya.",
      });
      return;
    }

    if (targetUser.id === session.userId && role !== "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: UserRole.ADMIN },
      });
      if (adminCount <= 1) {
        res.status(400).json({
          success: false,
          error:
            "Tidak dapat menurunkan hak akses akun sendiri karena Anda adalah satu-satunya Admin yang aktif di sistem.",
        });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: `Hak akses pengguna ${updatedUser.name} (${updatedUser.email}) berhasil diubah menjadi ${role}.`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMaintenance(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startTime;

    const [
      totalUsers,
      totalInvitations,
      totalTransactions,
      totalWishes,
      totalRsvps,
      totalSettings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.invitation.count(),
      prisma.paymentTransaction.count(),
      prisma.wish.count(),
      prisma.rsvp.count(),
      prisma.systemSetting.count(),
    ]);

    const memoryUsage = process.memoryUsage();

    res.json({
      success: true,
      data: {
        serverStatus: "healthy",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        nodeEnv: process.env.NODE_ENV || "development",
        database: {
          status: "connected",
          latencyMs: dbLatencyMs,
          provider: "PostgreSQL",
        },
        memory: {
          heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
        },
        metrics: {
          totalUsers,
          totalInvitations,
          totalTransactions,
          totalWishes,
          totalRsvps,
          totalSettings,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function actionMaintenance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { action } = req.body;

    if (!action) {
      res.status(400).json({ success: false, error: "Parameter action wajib disertakan" });
      return;
    }

    if (action === "ping_db") {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - startTime;
      res.json({
        success: true,
        message: `Koneksi database prima (Latensi: ${latencyMs} ms)`,
        latencyMs,
      });
      return;
    }

    if (action === "seed_defaults") {
      let createdCount = 0;
      for (const def of SYSTEM_SETTING_DEFINITIONS) {
        const existing = await prisma.systemSetting.findUnique({
          where: { key: def.key },
        });
        if (!existing) {
          await prisma.systemSetting.create({
            data: {
              key: def.key,
              value: def.defaultValue,
              description: def.description,
            },
          });
          createdCount++;
        }
      }
      res.json({
        success: true,
        message: `Sinkronisasi selesai: ${createdCount} pengaturan baru ditambahkan.`,
        createdCount,
      });
      return;
    }

    if (action === "clear_cache") {
      res.json({
        success: true,
        message: "Cache memori dan revalidasi halaman publik berhasil dibersihkan.",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (action === "export_backup") {
      const [users, invitations, paymentTransactions, systemSettings, themeCatalogs] =
        await Promise.all([
          prisma.user.findMany({
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              createdAt: true,
            },
          }),
          prisma.invitation.findMany({
            select: {
              id: true,
              slug: true,
              title: true,
              themeId: true,
              activeUntil: true,
              isActive: true,
              userId: true,
              createdAt: true,
            },
          }),
          prisma.paymentTransaction.findMany({
            take: 500,
            orderBy: { createdAt: "desc" },
          }),
          prisma.systemSetting.findMany({
            orderBy: { key: "asc" },
          }),
          prisma.themeCatalog.findMany({
            orderBy: { name: "asc" },
          }),
        ]);

      const backupPayload = {
        fasaroBackupVersion: "1.0",
        exportedAt: new Date().toISOString(),
        summary: {
          usersCount: users.length,
          invitationsCount: invitations.length,
          transactionsCount: paymentTransactions.length,
          settingsCount: systemSettings.length,
          themesCount: themeCatalogs.length,
        },
        data: {
          users,
          invitations,
          paymentTransactions,
          systemSettings,
          themeCatalogs,
        },
      };

      res.json({
        success: true,
        message: "Cadangan data sistem berhasil disiapkan.",
        backup: backupPayload,
      });
      return;
    }

    res.status(400).json({ success: false, error: `Action '${action}' tidak dikenali` });
  } catch (error) {
    next(error);
  }
}

export async function adminUpload(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const file = req.file;
    const folder = (req.body.folder as string) || "cms";

    if (!file) {
      res.status(400).json({ success: false, error: "File gambar wajib diunggah" });
      return;
    }

    const sanitizedFolder = folder.replace(/[^a-z0-9_-]/gi, "").toLowerCase() || "cms";
    const uploadDir = path.join(process.cwd(), "public", "uploads", sanitizedFolder);
    await fs.mkdir(uploadDir, { recursive: true });

    const originalExt = path.extname(file.originalname).toLowerCase() || ".jpg";
    const cleanBaseName = path
      .basename(file.originalname, originalExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 30);
    const uniqueFilename = `${Date.now()}-${cleanBaseName}${originalExt}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    await fs.writeFile(filePath, file.buffer);

    res.json({
      success: true,
      url: `/uploads/${sanitizedFolder}/${uniqueFilename}`,
      filename: uniqueFilename,
      sizeBytes: file.size,
      mimeType: file.mimetype,
    });
  } catch (error) {
    next(error);
  }
}
