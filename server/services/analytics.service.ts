import crypto from "crypto";
import prisma from "../config/prisma";

export interface InvitationAnalyticsSummary {
  totalViews: number;
  todayViews: number;
  mobilePercent: number;
}

function parseDeviceType(userAgent?: string): "mobile" | "desktop" {
  if (!userAgent) return "mobile";
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent) ? "mobile" : "desktop";
}

function parseBrowser(userAgent?: string): string {
  if (!userAgent) return "Unknown";
  if (/Edg\//i.test(userAgent)) return "Edge";
  if (/Chrome\//i.test(userAgent)) return "Chrome";
  if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) return "Safari";
  if (/Firefox\//i.test(userAgent)) return "Firefox";
  return "Browser";
}

function hashIp(ip?: string): string {
  if (!ip) return "anonymous";
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function generateCuidLikeId(): string {
  return "view_" + crypto.randomBytes(12).toString("hex");
}

export async function recordInvitationVisit(
  invitationId: string,
  options: {
    guestName?: string | null;
    userAgent?: string;
    ip?: string;
  }
): Promise<boolean> {
  if (!invitationId) return false;

  try {
    const ipHash = hashIp(options.ip);
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Deduplication: prevent counting refresh within 15 minutes from same IP/guest
    const existing = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM invitation_views
      WHERE "invitationId" = ${invitationId}
        AND "ipHash" = ${ipHash}
        AND "visitedAt" >= ${fifteenMinutesAgo}
      LIMIT 1
    `;

    if (existing && existing.length > 0) {
      return false; // Already recorded recently
    }

    const id = generateCuidLikeId();
    const deviceType = parseDeviceType(options.userAgent);
    const browser = parseBrowser(options.userAgent);
    const guestName = options.guestName?.trim() || null;

    await prisma.$executeRaw`
      INSERT INTO invitation_views ("id", "invitationId", "guestName", "deviceType", "browser", "ipHash", "visitedAt")
      VALUES (${id}, ${invitationId}, ${guestName}, ${deviceType}, ${browser}, ${ipHash}, NOW())
    `;

    return true;
  } catch (error) {
    // Log error internally without throwing to avoid breaking the guest's viewing experience
    console.error("Gagal mencatat statistik kunjungan undangan:", error);
    return false;
  }
}

export async function getInvitationAnalytics(
  invitationId: string
): Promise<InvitationAnalyticsSummary> {
  if (!invitationId) {
    return { totalViews: 0, todayViews: 0, mobilePercent: 100 };
  }

  try {
    const [totalRows, todayRows, mobileRows] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint as count FROM invitation_views
        WHERE "invitationId" = ${invitationId}
      `,
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint as count FROM invitation_views
        WHERE "invitationId" = ${invitationId}
          AND "visitedAt" >= CURRENT_DATE
      `,
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint as count FROM invitation_views
        WHERE "invitationId" = ${invitationId}
          AND "deviceType" = 'mobile'
      `,
    ]);

    const totalViews = Number(totalRows[0]?.count || 0);
    const todayViews = Number(todayRows[0]?.count || 0);
    const mobileCount = Number(mobileRows[0]?.count || 0);
    const mobilePercent = totalViews > 0 ? Math.round((mobileCount / totalViews) * 100) : 100;

    return {
      totalViews,
      todayViews,
      mobilePercent,
    };
  } catch (error) {
    console.error("Gagal mengambil analitik undangan:", error);
    return { totalViews: 0, todayViews: 0, mobilePercent: 100 };
  }
}

// ==========================================
// In-House Real-Time Visitor Heartbeat (100% Free & Localhost Compatible)
// ==========================================

interface ActiveVisitorSession {
  visitorId: string;
  lastSeen: number;
}

const activeVisitorsMap = new Map<string, Map<string, ActiveVisitorSession>>();

export function recordVisitorHeartbeat(slug: string, visitorId: string): number {
  if (!slug || !visitorId) return 0;
  const cleanSlug = slug.toLowerCase().trim();
  let sessions = activeVisitorsMap.get(cleanSlug);
  if (!sessions) {
    sessions = new Map();
    activeVisitorsMap.set(cleanSlug, sessions);
  }

  sessions.set(visitorId, {
    visitorId,
    lastSeen: Date.now(),
  });

  // Prune expired sessions (> 35s)
  const now = Date.now();
  for (const [id, s] of sessions.entries()) {
    if (now - s.lastSeen > 35000) {
      sessions.delete(id);
    }
  }

  return sessions.size;
}

export function removeVisitorSession(slug: string, visitorId: string): number {
  if (!slug || !visitorId) return 0;
  const cleanSlug = slug.toLowerCase().trim();
  const sessions = activeVisitorsMap.get(cleanSlug);
  if (sessions) {
    sessions.delete(visitorId);
    return sessions.size;
  }
  return 0;
}

export function getLiveVisitorsCount(slug: string): number {
  if (!slug) return 0;
  const cleanSlug = slug.toLowerCase().trim();
  const sessions = activeVisitorsMap.get(cleanSlug);
  if (!sessions) return 0;

  const now = Date.now();
  let count = 0;
  for (const [id, s] of sessions.entries()) {
    if (now - s.lastSeen <= 35000) {
      count++;
    } else {
      sessions.delete(id);
    }
  }

  return count;
}

