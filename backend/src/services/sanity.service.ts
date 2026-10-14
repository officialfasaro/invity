import { createClient, SanityClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config();

function getSanityConfig() {
  const projectId =
    process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || "";
  const dataset =
    process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || "production";
  const apiVersion =
    process.env.SANITY_API_VERSION || process.env.VITE_SANITY_API_VERSION || "2024-01-01";
  const token = process.env.SANITY_API_TOKEN || "";
  return { projectId, dataset, apiVersion, token };
}

let cachedClient: SanityClient | null = null;

export function getSanityClient(): SanityClient | null {
  if (cachedClient) return cachedClient;
  const { projectId, dataset, apiVersion, token } = getSanityConfig();
  if (!projectId || !token) return null;
  cachedClient = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
  return cachedClient;
}

export function isSanityConfigured(): boolean {
  const { projectId, token } = getSanityConfig();
  return Boolean(projectId && token);
}

export interface SanityInvitationSyncPayload {
  id: string;
  slug: string;
  title: string;
  themeId: string;
  isActive: boolean;
  activeUntil?: Date | string | null;
  coupleInfo?: Record<string, unknown> | null;
  eventSchedules?: Array<{
    eventName: string;
    date: Date | string;
    startTime: string;
    endTime?: string | null;
    venueName: string;
    address: string;
    mapsUrl?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }>;
  galleries?: Array<{
    imageUrl: string;
    caption?: string | null;
    sortOrder?: number;
  }>;
  bankAccounts?: Array<{
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    qrisImageUrl?: string | null;
  }>;
}

/**
 * Sinkronisasi data undangan pernikahan ke Sanity CMS
 */
export async function syncInvitationToSanity(
  invitation: SanityInvitationSyncPayload
): Promise<{ success: boolean; sanityId?: string; error?: string }> {
  const client = getSanityClient();
  if (!client) {
    return {
      success: false,
      error: "Sanity client belum terkonfigurasi (SANITY_PROJECT_ID atau SANITY_API_TOKEN kosong)",
    };
  }

  try {
    const documentId = `invitation-${invitation.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const coupleInfo = (invitation.coupleInfo as Record<string, any>) || {};

    const sanityDoc = {
      _id: documentId,
      _type: "weddingInvitation",
      invitationId: invitation.id,
      slug: invitation.slug,
      title: invitation.title,
      themeId: invitation.themeId || "botanical",
      isActive: Boolean(invitation.isActive),
      activeUntil: invitation.activeUntil
        ? new Date(invitation.activeUntil).toISOString()
        : null,
      coupleInfo: {
        groomName: coupleInfo.groomName || "",
        groomNickname: coupleInfo.groomNickname || "",
        groomFather: coupleInfo.groomFather || "",
        groomMother: coupleInfo.groomMother || "",
        groomInstagram: coupleInfo.groomInstagram || "",
        groomPhoto: coupleInfo.groomPhoto || "",
        brideName: coupleInfo.brideName || "",
        brideNickname: coupleInfo.brideNickname || "",
        brideFather: coupleInfo.brideFather || "",
        brideMother: coupleInfo.brideMother || "",
        brideInstagram: coupleInfo.brideInstagram || "",
        bridePhoto: coupleInfo.bridePhoto || "",
        greetingMessage: coupleInfo.greetingMessage || "",
        stories: Array.isArray(coupleInfo.stories) ? coupleInfo.stories : [],
        musicUrl: coupleInfo.musicUrl || null,
        youtubeVideoUrl: coupleInfo.youtubeVideoUrl || null,
        giftAddress: coupleInfo.giftAddress || null,
        giftReceiver: coupleInfo.giftReceiver || null,
        giftPhone: coupleInfo.giftPhone || null,
        backgroundImage: coupleInfo.backgroundImage || null,
        floralOrnament: coupleInfo.floralOrnament || null,
      },
      eventSchedules: (invitation.eventSchedules || []).map((s, idx) => ({
        _key: `schedule-${idx}`,
        eventName: s.eventName,
        date: new Date(s.date).toISOString(),
        startTime: s.startTime,
        endTime: s.endTime || null,
        venueName: s.venueName,
        address: s.address,
        mapsUrl: s.mapsUrl || null,
        latitude: s.latitude || null,
        longitude: s.longitude || null,
      })),
      galleries: (invitation.galleries || []).map((g, idx) => ({
        _key: `gallery-${idx}`,
        imageUrl: g.imageUrl,
        caption: g.caption || null,
        sortOrder: g.sortOrder !== undefined ? g.sortOrder : idx,
      })),
      bankAccounts: (invitation.bankAccounts || []).map((b, idx) => ({
        _key: `bank-${idx}`,
        bankName: b.bankName,
        accountNumber: b.accountNumber,
        accountHolder: b.accountHolder,
        qrisImageUrl: b.qrisImageUrl || null,
      })),
      syncedAt: new Date().toISOString(),
    };

    const result = await client.createOrReplace(sanityDoc);
    return { success: true, sanityId: result._id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Gagal sinkron ke Sanity";
    console.error("[SanitySync] Error syncing invitation to Sanity:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Sinkronisasi Pengaturan Konten Web & Showcase ke Sanity CMS
 */
export async function syncCmsSettingsToSanity(
  settings: Array<{ key: string; value: string; description?: string | null }>
): Promise<{ success: boolean; sanityId?: string; error?: string }> {
  const client = getSanityClient();
  if (!client) {
    return {
      success: false,
      error: "Sanity client belum terkonfigurasi",
    };
  }

  try {
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    const sanityDoc = {
      _id: "siteSettings-global",
      _type: "siteSettings",
      title: "Fasaro Invity - Global Site Settings",
      settings: settingsMap,
      updatedAt: new Date().toISOString(),
    };

    const result = await client.createOrReplace(sanityDoc);
    return { success: true, sanityId: result._id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Gagal sinkron CMS settings ke Sanity";
    console.error("[SanitySync] Error syncing settings to Sanity:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Cek status koneksi dan latensi ke Sanity CMS
 */
export async function testSanityConnection(): Promise<{
  connected: boolean;
  latencyMs: number;
  projectId: string;
  dataset: string;
  documentCount?: number;
  error?: string;
}> {
  const { projectId, dataset } = getSanityConfig();
  const client = getSanityClient();
  if (!client) {
    return {
      connected: false,
      latencyMs: 0,
      projectId,
      dataset,
      error: "Sanity belum terkonfigurasi di file .env",
    };
  }

  const start = Date.now();
  try {
    const count = await client.fetch<number>('count(*[_type == "weddingInvitation"])');
    const latencyMs = Date.now() - start;
    return {
      connected: true,
      latencyMs,
      projectId,
      dataset,
      documentCount: count,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    return {
      connected: false,
      latencyMs,
      projectId,
      dataset,
      error: error instanceof Error ? error.message : "Gagal terhubung ke Sanity API",
    };
  }
}
