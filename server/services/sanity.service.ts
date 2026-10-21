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
    const count = await client.fetch<number>('count(*[_type in ["weddingInvitation", "themeTemplate", "siteSettings"]])');
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

export interface SanityThemeTemplate {
  _id?: string;
  _type?: "themeTemplate";
  themeKey: string;
  name: string;
  category: string;
  thumbnail: string;
  previewUrl?: string | null;
  isPremium: boolean;
  isActive: boolean;
  features: string[];
  designConfig?: {
    primaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
    backgroundUrl?: string;
    musicDefaultUrl?: string;
    ornamentUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const OFFICIAL_THEMES_SEED: SanityThemeTemplate[] = [
  {
    themeKey: "botanical",
    name: "Botanical Tema 01",
    category: "Botanical",
    thumbnail: "/templates/botanical/cover.jpg",
    previewUrl: "/invitation/demo-botanical",
    isPremium: false,
    isActive: true,
    features: [
      "hero_cover",
      "couple_profile",
      "event_schedule",
      "google_maps",
      "love_story",
      "gallery_photo",
      "wishes_guestbook",
      "rsvp_attendance",
      "digital_envelope",
      "floating_music",
    ],
    designConfig: {
      primaryColor: "#4B5320",
      accentColor: "#F97316",
      fontFamily: "Outfit, sans-serif",
    },
  },
  {
    themeKey: "editorial",
    name: "Editorial Tema 01",
    category: "Editorial",
    thumbnail: "/templates/editorial/cover.jpg",
    previewUrl: "/invitation/demo-editorial",
    isPremium: false,
    isActive: true,
    features: [
      "hero_cover",
      "couple_profile",
      "event_schedule",
      "google_maps",
      "love_story",
      "gallery_photo",
      "wishes_guestbook",
      "rsvp_attendance",
      "digital_envelope",
      "floating_music",
    ],
    designConfig: {
      primaryColor: "#1E293B",
      accentColor: "#F97316",
      fontFamily: "Playfair Display, serif",
    },
  },
  {
    themeKey: "gothic",
    name: "Gothic Tema 01",
    category: "Gothic",
    thumbnail: "/templates/gothic/cover.jpg",
    previewUrl: "/invitation/demo-gothic",
    isPremium: false,
    isActive: true,
    features: [
      "hero_cover",
      "couple_profile",
      "event_schedule",
      "google_maps",
      "love_story",
      "gallery_photo",
      "wishes_guestbook",
      "rsvp_attendance",
      "digital_envelope",
      "floating_music",
    ],
    designConfig: {
      primaryColor: "#0F172A",
      accentColor: "#D97706",
      fontFamily: "Cinzel, serif",
    },
  },
  {
    themeKey: "raka-ayu",
    name: "Royal Tema 01",
    category: "Royal",
    thumbnail: "/templates/raka-ayu/cover.jpg",
    previewUrl: "/invitation/demo-raka-ayu",
    isPremium: false,
    isActive: true,
    features: [
      "hero_cover",
      "couple_profile",
      "event_schedule",
      "google_maps",
      "love_story",
      "gallery_photo",
      "wishes_guestbook",
      "rsvp_attendance",
      "digital_envelope",
      "floating_music",
      "qr_ticket",
    ],
    designConfig: {
      primaryColor: "#064E3B",
      accentColor: "#D97706",
      fontFamily: "Cinzel Decorative, serif",
    },
  },
  {
    themeKey: "wedding-3d",
    name: "3D Tema 01",
    category: "3D",
    thumbnail: "/templates/wedding-3d/cover.jpg",
    previewUrl: "/invitation/demo-wedding-3d",
    isPremium: false,
    isActive: true,
    features: [
      "hero_cover",
      "couple_profile",
      "event_schedule",
      "google_maps",
      "love_story",
      "gallery_photo",
      "wishes_guestbook",
      "rsvp_attendance",
      "digital_envelope",
      "floating_music",
      "interactive_3d",
      "qr_ticket",
    ],
    designConfig: {
      primaryColor: "#1E1B4B",
      accentColor: "#F97316",
      fontFamily: "Outfit, sans-serif",
    },
  },
];

/**
 * Mengambil seluruh katalog tema dari Sanity CMS
 */
export async function getSanityThemes(): Promise<SanityThemeTemplate[]> {
  const client = getSanityClient();
  if (!client) return [];

  try {
    const themes = await client.fetch<SanityThemeTemplate[]>(
      `*[_type == "themeTemplate"] | order(createdAt asc)`
    );
    return themes;
  } catch (error) {
    console.error("[SanityService] Error fetching themes from Sanity:", error);
    return [];
  }
}

/**
 * Mengambil satu tema berdasarkan themeKey dari Sanity CMS
 */
export async function getSanityThemeByKey(
  themeKey: string
): Promise<SanityThemeTemplate | null> {
  const client = getSanityClient();
  if (!client) return null;

  try {
    const theme = await client.fetch<SanityThemeTemplate | null>(
      `*[_type == "themeTemplate" && themeKey == $key][0]`,
      { key: themeKey.toLowerCase().trim() }
    );
    return theme;
  } catch (error) {
    console.error(`[SanityService] Error fetching theme ${themeKey}:`, error);
    return null;
  }
}

/**
 * Membuat atau memperbarui data tema & design source di Sanity CMS
 */
export async function createOrUpdateSanityTheme(
  themeData: Partial<SanityThemeTemplate> & { themeKey: string }
): Promise<{ success: boolean; theme?: SanityThemeTemplate; error?: string }> {
  const client = getSanityClient();
  if (!client) {
    return { success: false, error: "Sanity client belum siap" };
  }

  try {
    const cleanKey = themeData.themeKey.toLowerCase().trim();
    const docId = `theme-${cleanKey.replace(/[^a-zA-Z0-9_-]/g, "")}`;

    const doc = {
      _id: docId,
      _type: "themeTemplate",
      themeKey: cleanKey,
      name: themeData.name || cleanKey,
      category: themeData.category || "Minimalist",
      thumbnail: themeData.thumbnail || "",
      previewUrl: themeData.previewUrl || `/invitation/demo-${cleanKey}`,
      isPremium: Boolean(themeData.isPremium),
      isActive: themeData.isActive !== undefined ? Boolean(themeData.isActive) : true,
      features: Array.isArray(themeData.features) ? themeData.features : [],
      designConfig: themeData.designConfig || {},
      updatedAt: new Date().toISOString(),
    };

    const saved = await client.createOrReplace(doc);
    return { success: true, theme: saved as unknown as SanityThemeTemplate };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal menyimpan tema ke Sanity";
    console.error("[SanityService] Error saving theme:", msg);
    return { success: false, error: msg };
  }
}

/**
 * Menghapus tema dari Sanity CMS
 */
export async function deleteSanityTheme(
  themeKey: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSanityClient();
  if (!client) {
    return { success: false, error: "Sanity client belum siap" };
  }

  try {
    const cleanKey = themeKey.toLowerCase().trim();
    const docId = `theme-${cleanKey.replace(/[^a-zA-Z0-9_-]/g, "")}`;
    await client.delete(docId);
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal menghapus tema di Sanity";
    console.error("[SanityService] Error deleting theme in Sanity:", msg);
    return { success: false, error: msg };
  }
}

/**
 * Mengunggah file aset gambar (cover/thumbnail/ornamen) langsung ke Sanity CDN Asset Pipeline
 * Menghemat storage Supabase karena aset statis disimpan di CDN Sanity
 */
export async function uploadSanityAsset(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<{ success: boolean; url?: string; assetId?: string; error?: string }> {
  const client = getSanityClient();
  if (!client) {
    return { success: false, error: "Sanity client belum terkonfigurasi" };
  }

  try {
    const asset = await client.assets.upload("image", buffer, {
      filename,
      contentType,
    });
    return {
      success: true,
      url: asset.url,
      assetId: asset._id,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Gagal upload aset ke Sanity CDN";
    console.error("[SanityService] Error uploading asset to Sanity:", msg);
    return { success: false, error: msg };
  }
}

/**
 * Mengambil pengaturan konten website (CMS) dari Sanity CMS
 */
export async function getSanityCmsSettings(): Promise<Record<string, string> | null> {
  const client = getSanityClient();
  if (!client) return null;

  try {
    const doc = await client.fetch<{ settings?: Record<string, string> } | null>(
      `*[_id == "siteSettings-global"][0]`
    );
    return doc?.settings || null;
  } catch (error) {
    console.error("[SanityService] Error fetching CMS settings from Sanity:", error);
    return null;
  }
}

/**
 * Seeding tema awal ke Sanity jika Sanity masih kosong
 */
export async function seedDefaultThemesToSanity(): Promise<SanityThemeTemplate[]> {
  const client = getSanityClient();
  if (!client) return [];

  try {
    const existingThemes = await client.fetch<SanityThemeTemplate[]>(
      `*[_type == "themeTemplate"]`
    );
    if (existingThemes.length >= OFFICIAL_THEMES_SEED.length) {
      return existingThemes;
    }

    const existingKeys = new Set(existingThemes.map((t) => t.themeKey));
    const created: SanityThemeTemplate[] = [...existingThemes];

    for (const seed of OFFICIAL_THEMES_SEED) {
      if (!existingKeys.has(seed.themeKey)) {
        const res = await createOrUpdateSanityTheme(seed);
        if (res.theme) {
          created.push(res.theme);
        }
      }
    }

    return created;
  } catch (error) {
    console.error("[SanityService] Error seeding default themes to Sanity:", error);
    return [];
  }
}

