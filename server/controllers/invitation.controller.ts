import { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma";
import { invitationSchema, updateInvitationSchema } from "../utils/validations";
import { Prisma } from "@prisma/client";
import { invalidateInvitationCache } from "../services/cache.service";

export async function listInvitations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;

    const invitations = await prisma.invitation.findMany({
      where: { userId: user.userId },
      include: {
        eventSchedules: { orderBy: { date: "asc" } },
        galleries: { orderBy: { sortOrder: "asc" } },
        bankAccounts: true,
        _count: {
          select: {
            guests: true,
            rsvps: true,
            wishes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: invitations });
  } catch (error) {
    next(error);
  }
}

export async function createInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const parsed = invitationSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi gagal",
        details: parsed.error.format(),
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
      bankAccounts,
    } = parsed.data;

    const existingSlug = await prisma.invitation.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      res.status(409).json({ error: "Slug sudah digunakan, silakan pilih slug lain" });
      return;
    }

    const invitation = await prisma.invitation.create({
      data: {
        userId: user.userId,
        title,
        slug,
        themeId,
        coupleInfo: coupleInfo as Prisma.InputJsonValue,
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
            longitude: schedule.longitude ?? null,
          })),
        },
        galleries: {
          create: galleries.map((gallery) => ({
            imageUrl: gallery.imageUrl,
            caption: gallery.caption ?? null,
            sortOrder: gallery.sortOrder,
          })),
        },
        bankAccounts: {
          create: bankAccounts.map((account) => ({
            bankName: account.bankName,
            accountNumber: account.accountNumber,
            accountHolder: account.accountHolder,
            qrisImageUrl: account.qrisImageUrl || null,
          })),
        },
      },
      include: {
        eventSchedules: true,
        galleries: true,
        bankAccounts: true,
      },
    });

    res.status(201).json({
      message: "Undangan berhasil dibuat",
      data: invitation,
    });
  } catch (error) {
    next(error);
  }
}

export async function getInvitationById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const rawId = req.params.id;
    const id = (Array.isArray(rawId) ? rawId[0] : rawId) || "";

    const invitation = await prisma.invitation.findFirst({
      where: {
        id,
        userId: user.userId,
      },
      include: {
        eventSchedules: { orderBy: { date: "asc" } },
        galleries: { orderBy: { sortOrder: "asc" } },
        bankAccounts: true,
        guests: true,
        rsvps: { orderBy: { createdAt: "desc" } },
        wishes: { orderBy: { createdAt: "desc" } },
      },
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

export async function updateInvitationById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const rawId = req.params.id;
    const id = (Array.isArray(rawId) ? rawId[0] : rawId) || "";

    const existing = await prisma.invitation.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    });

    if (!existing) {
      res.status(404).json({ error: "Undangan tidak ditemukan" });
      return;
    }

    const parsed = updateInvitationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Validasi gagal",
        details: parsed.error.format(),
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
      bankAccounts,
    } = parsed.data;

    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.invitation.findUnique({
        where: { slug },
      });
      if (slugTaken) {
        res.status(409).json({ error: "Slug sudah digunakan oleh undangan lain" });
        return;
      }
    }

    const mergedCoupleInfo = coupleInfo
      ? {
          ...(existing.coupleInfo as Record<string, unknown>),
          ...coupleInfo,
        }
      : existing.coupleInfo;

    const updated = await prisma.$transaction(async (tx) => {
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
            longitude: schedule.longitude ?? null,
          })),
        });
      }

      if (galleries) {
        await tx.gallery.deleteMany({ where: { invitationId: id } });
        await tx.gallery.createMany({
          data: galleries.map((gallery) => ({
            invitationId: id,
            imageUrl: gallery.imageUrl,
            caption: gallery.caption ?? null,
            sortOrder: gallery.sortOrder,
          })),
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
            qrisImageUrl: account.qrisImageUrl || null,
          })),
        });
      }

      return tx.invitation.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(slug !== undefined && { slug }),
          ...(themeId !== undefined && { themeId }),
          ...(coupleInfo !== undefined && {
            coupleInfo: mergedCoupleInfo as Prisma.InputJsonValue,
          }),
          ...(activeUntil !== undefined && {
            activeUntil: activeUntil ? new Date(activeUntil) : null,
          }),
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          eventSchedules: true,
          galleries: true,
          bankAccounts: true,
        },
      });
    });

    invalidateInvitationCache(updated.slug, updated.id);
    if (existing.slug !== updated.slug) {
      invalidateInvitationCache(existing.slug, existing.id);
    }

    res.json({
      message: "Undangan berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
