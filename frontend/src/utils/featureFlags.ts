import { FeatureId, WeddingInvitationData } from "@/types/wedding";

export const ALL_FEATURE_IDS: FeatureId[] = [
  "music",
  "rsvp",
  "wishes",
  "digital_gift",
  "physical_gift",
  "love_story",
  "gallery",
  "countdown",
  "google_maps",
  "qr_ticket",
];

export function normalizeThemeKey(rawKey?: string): string {
  const k = (rawKey || "botanical").toLowerCase().trim();
  if (k.includes("3d") || k.includes("three")) return "wedding-3d";
  if (k.includes("raka") || k.includes("royal")) return "raka-ayu";
  if (k.includes("gothic") || k.includes("invisimple")) return "gothic";
  if (k.includes("editorial")) return "editorial";
  return "botanical";
}

export function parseFeaturesJson(jsonStr?: string | null): FeatureId[] {
  if (!jsonStr) return ALL_FEATURE_IDS;
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return parsed as FeatureId[];
    }
  } catch {
    // fallback
  }
  return ALL_FEATURE_IDS;
}

export interface FeatureCheckOptions {
  data?: WeddingInvitationData;
  forcedThemeId?: string;
  settings?: Record<string, string>;
}

/**
 * Memeriksa apakah suatu fitur aktif berdasarkan sinkronisasi:
 * 1. Saklar fitur global
 * 2. Paket langganan yang dipilih klien (atau Paket Promo Launching default)
 * 3. Pengaturan fitur yang aktif pada template terkait
 */
export function isFeatureAvailable(
  featureId: FeatureId,
  options: FeatureCheckOptions = {}
): boolean {
  const { data, forcedThemeId, settings = data?.systemSettings } = options;

  // 1. Saklar Global
  if (settings) {
    if (featureId === "music" && settings.feature_music === "false") return false;
    if (featureId === "rsvp" && settings.feature_rsvp === "false") return false;
    if (featureId === "wishes" && settings.feature_wishes === "false") return false;
    if (featureId === "digital_gift" && settings.feature_digital_gift === "false") return false;
  }

  // 2. Sinkronisasi Paket Langganan
  const singlePromo = settings?.single_promo_mode !== "false";
  const rawTier = data?.tier || (data?.coupleInfo as Record<string, unknown> | undefined)?.selectedTier;
  const userTier = typeof rawTier === "string" ? rawTier.toLowerCase() : "";

  let packageFeatureList: FeatureId[] = ALL_FEATURE_IDS;

  if (singlePromo) {
    packageFeatureList = parseFeaturesJson(settings?.package_features_promo);
  } else if (userTier === "starter") {
    packageFeatureList = parseFeaturesJson(
      settings?.package_features_starter ??
        '["gallery","countdown","google_maps","wishes","digital_gift"]'
    );
  } else if (userTier === "elegant") {
    packageFeatureList = parseFeaturesJson(settings?.package_features_elegant);
  } else if (userTier === "ultimate") {
    packageFeatureList = parseFeaturesJson(settings?.package_features_ultimate);
  } else {
    packageFeatureList = parseFeaturesJson(settings?.package_features_promo);
  }

  if (!packageFeatureList.includes(featureId)) {
    return false;
  }

  // 3. Sinkronisasi Fitur Per Template
  const activeTheme = normalizeThemeKey(forcedThemeId || data?.themeId);
  const templateSettingKey = `template_features_${activeTheme}`;
  const templateFeatureList = parseFeaturesJson(settings?.[templateSettingKey]);

  if (!templateFeatureList.includes(featureId)) {
    return false;
  }

  return true;
}
