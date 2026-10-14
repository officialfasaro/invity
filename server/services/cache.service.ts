import prisma from "../config/prisma";

interface CachedInvitationMeta {
  id: string;
  isActive: boolean;
  expiresAt: number;
}

interface CachedFullInvitation {
  data: any;
  expiresAt: number;
}

const metaCache = new Map<string, CachedInvitationMeta>();
const fullInvitationCache = new Map<string, CachedFullInvitation>();

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function getInvitationMeta(
  identifier: string
): Promise<{ id: string; isActive: boolean } | null> {
  const now = Date.now();
  const cached = metaCache.get(identifier);

  if (cached && cached.expiresAt > now) {
    return { id: cached.id, isActive: cached.isActive };
  }

  const cleanSlug = identifier.replace(/^demo-/, "");
  const isCuid = identifier.startsWith("c") && identifier.length > 20;

  let invitation: { id: string; isActive: boolean } | null = null;

  try {
    if (isCuid) {
      invitation = await prisma.invitation.findUnique({
        where: { id: identifier },
        select: { id: true, isActive: true },
      });
    } else {
      invitation = await prisma.invitation.findUnique({
        where: { slug: cleanSlug },
        select: { id: true, isActive: true },
      });

      if (!invitation && cleanSlug !== identifier) {
        invitation = await prisma.invitation.findUnique({
          where: { slug: identifier },
          select: { id: true, isActive: true },
        });
      }
    }
  } catch {
    return null;
  }

  if (invitation) {
    const entry: CachedInvitationMeta = {
      id: invitation.id,
      isActive: invitation.isActive,
      expiresAt: now + CACHE_TTL_MS,
    };
    metaCache.set(identifier, entry);
    metaCache.set(invitation.id, entry);
    metaCache.set(cleanSlug, entry);
    return { id: invitation.id, isActive: invitation.isActive };
  }

  return null;
}

export async function getCachedPublicInvitation(slug: string) {
  const now = Date.now();
  const cached = fullInvitationCache.get(slug);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  const invitation = await prisma.invitation.findFirst({
    where: {
      slug,
      isActive: true,
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
          longitude: true,
        },
        orderBy: { date: "asc" },
      },
      galleries: {
        select: {
          id: true,
          imageUrl: true,
          caption: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
      },
      bankAccounts: {
        select: {
          id: true,
          bankName: true,
          accountNumber: true,
          accountHolder: true,
          qrisImageUrl: true,
        },
      },
    },
  });

  if (invitation) {
    fullInvitationCache.set(slug, {
      data: invitation,
      expiresAt: now + 5 * 60 * 1000, // 5 mins
    });
  }

  return invitation;
}

export function invalidateInvitationCache(slug: string, id?: string): void {
  metaCache.delete(slug);
  fullInvitationCache.delete(slug);
  if (id) {
    metaCache.delete(id);
  }
}
