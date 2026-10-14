import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { createOrderSchema } from "../utils/validations";
import {
  createSnapTransaction,
  verifyMidtransSignature,
} from "../services/payment.service";

export async function createOrder(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const parsed = createOrderSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi data pembayaran gagal",
        details: parsed.error.format(),
      });
      return;
    }

    const { invitationId, tier, amount, paymentType, proofImageUrl } = parsed.data;

    if (invitationId) {
      const invitation = await prisma.invitation.findFirst({
        where: {
          id: invitationId,
          userId: user.userId,
        },
      });

      if (!invitation) {
        res.status(404).json({ error: "Undangan tidak ditemukan atau bukan milik Anda" });
        return;
      }
    }

    const singlePromoSetting = await prisma.systemSetting.findUnique({
      where: { key: "single_promo_mode" },
    });
    const isSinglePromo = singlePromoSetting ? singlePromoSetting.value !== "false" : true;

    let verifiedAmount: number;
    if (isSinglePromo) {
      const promoPriceSetting = await prisma.systemSetting.findUnique({
        where: { key: "promo_plan_price" },
      });
      verifiedAmount = promoPriceSetting ? parseInt(promoPriceSetting.value, 10) || 79000 : 79000;
    } else {
      const priceKey = `price_${tier.toLowerCase()}`;
      const priceSetting = await prisma.systemSetting.findUnique({
        where: { key: priceKey },
      });
      const defaultPrices: Record<string, number> = {
        STARTER: 39000,
        ELEGANT: 149000,
        ULTIMATE: 279000,
      };
      const officialPrice = priceSetting
        ? parseInt(priceSetting.value, 10) || defaultPrices[tier]
        : defaultPrices[tier];
      verifiedAmount = officialPrice > 0 ? officialPrice : amount;
    }

    const orderId = `FSR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const activeModeSetting = await prisma.systemSetting.findUnique({
      where: { key: "payment_active_mode" },
    });
    const activeMode = activeModeSetting?.value || "MANUAL_ONLY";

    if (paymentType === "GATEWAY") {
      if (activeMode === "MANUAL_ONLY") {
        res.status(403).json({
          error:
            "Pembayaran otomatis via Midtrans sedang dinonaktifkan oleh platform. Silakan gunakan metode Transfer Bank / QRIS Manual.",
        });
        return;
      }

      const midtransFlag = await prisma.systemSetting.findUnique({
        where: { key: "feature_midtrans_payment" },
      });
      if (midtransFlag && midtransFlag.value === "false") {
        res.status(403).json({
          error:
            "Pembayaran otomatis via Midtrans sedang dalam pemeliharaan. Silakan gunakan metode Transfer Bank / QRIS Manual.",
        });
        return;
      }

      const snapData = await createSnapTransaction(orderId, verifiedAmount, {
        first_name: user.email.split("@")[0],
        email: user.email,
      });

      const transaction = await prisma.paymentTransaction.create({
        data: {
          orderId,
          userId: user.userId,
          invitationId: invitationId ?? null,
          tier,
          amount: verifiedAmount,
          paymentType: "GATEWAY",
          paymentStatus: "PENDING",
        },
      });

      res.status(201).json({
        message: "Order Midtrans Snap berhasil dibuat",
        data: {
          transactionId: transaction.id,
          orderId: transaction.orderId,
          snapToken: snapData.token,
          redirectUrl: snapData.redirect_url,
        },
      });
      return;
    }

    // Manual Transfer
    if (activeMode === "GATEWAY_ONLY") {
      res.status(403).json({
        error:
          "Metode transfer manual sedang dinonaktifkan oleh platform. Silakan gunakan pembayaran otomatis Midtrans.",
      });
      return;
    }

    const manualFlag = await prisma.systemSetting.findUnique({
      where: { key: "feature_manual_payment" },
    });
    if (manualFlag && manualFlag.value === "false") {
      res.status(403).json({
        error: "Metode transfer manual sementara ditutup untuk pemeliharaan sistem.",
      });
      return;
    }

    if (!proofImageUrl) {
      res.status(400).json({
        error: "Bukti transfer (proofImageUrl) wajib diunggah untuk metode manual",
      });
      return;
    }

    const transaction = await prisma.paymentTransaction.create({
      data: {
        orderId,
        userId: user.userId,
        invitationId: invitationId ?? null,
        tier,
        amount: verifiedAmount,
        paymentType: paymentType === "MANUAL_QRIS" ? "MANUAL_QRIS" : "MANUAL_BANK",
        paymentStatus: "WAITING_VERIFICATION",
        proofImageUrl,
      },
    });

    res.status(201).json({
      message: "Pesanan manual berhasil dibuat, menunggu verifikasi admin",
      data: {
        transactionId: transaction.id,
        orderId: transaction.orderId,
        paymentStatus: transaction.paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function midtransWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = req.body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      res.status(400).json({ error: "Payload webhook Midtrans tidak lengkap" });
      return;
    }

    const isDev = process.env.MIDTRANS_IS_PRODUCTION !== "true";
    const isMock =
      process.env.MIDTRANS_SERVER_KEY?.includes("YOUR_SANDBOX") ||
      (isDev && signature_key === "dev_mock_signature");
    const isSignatureValid =
      isMock ||
      verifyMidtransSignature(order_id, status_code, gross_amount, signature_key);

    if (!isSignatureValid) {
      res.status(403).json({ error: "Signature key tidak valid" });
      return;
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { orderId: order_id },
      include: { invitation: true },
    });

    if (!transaction) {
      res.status(404).json({ error: `Transaksi dengan orderId ${order_id} tidak ditemukan` });
      return;
    }

    const isSettled =
      transaction_status === "settlement" ||
      (transaction_status === "capture" && fraud_status === "accept");

    if (isSettled) {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      await prisma.$transaction(async (tx) => {
        await tx.paymentTransaction.update({
          where: { orderId: order_id },
          data: {
            paymentStatus: "SETTLEMENT",
            verifiedAt: new Date(),
            verifiedBy: "MIDTRANS_WEBHOOK",
          },
        });

        let targetInvId = transaction.invitationId;
        if (!targetInvId) {
          let userInv = await tx.invitation.findFirst({
            where: { userId: transaction.userId },
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
                  selectedTier: transaction.tier,
                },
              },
            });
          }
          targetInvId = userInv.id;
          await tx.paymentTransaction.update({
            where: { orderId: order_id },
            data: { invitationId: targetInvId },
          });
        }

        if (targetInvId) {
          await tx.invitation.update({
            where: { id: targetInvId },
            data: {
              isActive: true,
              activeUntil: oneYearFromNow,
            },
          });
        }
      });

      res.json({
        message: "Status transaksi berhasil diperbarui ke SETTLEMENT dan undangan diaktifkan",
      });
      return;
    }

    if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      await prisma.paymentTransaction.update({
        where: { orderId: order_id },
        data: {
          paymentStatus: transaction_status === "expire" ? "EXPIRED" : "CANCELLED",
        },
      });

      res.json({
        message: `Status transaksi berhasil diperbarui ke ${transaction_status}`,
      });
      return;
    }

    res.json({ message: "Notifikasi diterima tanpa perubahan status" });
  } catch (error) {
    next(error);
  }
}

export async function onboardingSetup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const {
      groomName,
      brideName,
      phoneNumber,
      weddingDate,
      isDateUndecided,
      location,
      slug,
      tier,
      referralCode,
    } = req.body;

    if (!tier || !["STARTER", "ELEGANT", "ULTIMATE"].includes(tier)) {
      res.status(400).json({ error: "Pilihan paket tidak valid" });
      return;
    }

    const cleanGroom = (groomName || "").trim().slice(0, 50);
    const cleanBride = (brideName || "").trim().slice(0, 50);

    let invitation = await prisma.invitation.findFirst({
      where: { userId: user.userId },
    });

    let finalSlug = invitation?.slug;
    if (slug && slug.trim() !== "") {
      const sanitized = slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .slice(0, 30);
      if (sanitized) {
        const exists = await prisma.invitation.findFirst({
          where: { slug: sanitized, userId: { not: user.userId } },
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

    const title =
      cleanGroom && cleanBride
        ? `Pernikahan ${cleanGroom} & ${cleanBride}`
        : "Pernikahan Mempelai";

    const coupleInfo: Record<string, unknown> =
      (invitation?.coupleInfo as Record<string, unknown>) || {};
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
      invitation = await prisma.invitation.create({
        data: {
          userId: user.userId,
          slug: finalSlug,
          title,
          themeId: "botanical",
          coupleInfo: coupleInfo as Prisma.InputJsonValue,
          isActive: true,
        },
      });
    } else {
      invitation = await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          title,
          slug: finalSlug,
          coupleInfo: coupleInfo as Prisma.InputJsonValue,
        },
      });
    }

    if (weddingDate && !isDateUndecided) {
      const d = new Date(weddingDate);
      if (!isNaN(d.getTime())) {
        const firstSchedule = await prisma.eventSchedule.findFirst({
          where: { invitationId: invitation.id },
        });
        if (firstSchedule) {
          await prisma.eventSchedule.update({
            where: { id: firstSchedule.id },
            data: {
              date: d,
              address: location || firstSchedule.address,
            },
          });
        } else {
          await prisma.eventSchedule.create({
            data: {
              invitationId: invitation.id,
              eventName: "Akad & Resepsi",
              date: d,
              startTime: "09:00",
              venueName: location || "Lokasi Acara",
              address: location || "Alamat Acara",
            },
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
        tier,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOnboardingState(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const invitation = await prisma.invitation.findFirst({
      where: { userId: user.userId },
      include: {
        eventSchedules: {
          orderBy: { date: "asc" },
          take: 1,
        },
      },
    });

    if (!invitation) {
      res.json({ data: null });
      return;
    }

    const coupleInfo = (invitation.coupleInfo as Record<string, unknown>) || {};
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
        referralCode: coupleInfo.referralCode || "",
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const rawOrderId = Array.isArray(req.params.orderId)
      ? req.params.orderId[0]
      : req.params.orderId;

    const whereClause: Prisma.PaymentTransactionWhereInput =
      rawOrderId && rawOrderId !== "latest"
        ? {
            orderId: rawOrderId,
            ...(user.role !== "ADMIN" ? { userId: user.userId } : {}),
          }
        : {
            userId: user.userId,
          };

    const transaction = await prisma.paymentTransaction.findFirst({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        invitation: {
          select: { id: true, title: true, slug: true, activeUntil: true },
        },
      },
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

    const planNames: Record<string, string> = {
      STARTER: "Paket Promo All-In-One",
      ELEGANT: "Paket Promo All-In-One",
      ULTIMATE: "Paket Promo All-In-One",
      FREE: "Paket General",
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
        activeUntil: transaction.invitation?.activeUntil || null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const transactions = await prisma.paymentTransaction.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      take: 6,
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
          link: `/payment-status?orderId=${tx.orderId}`,
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
          link: "/dashboard",
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
          link: `/payment-status?orderId=${tx.orderId}`,
        });
      }
    }

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
}

