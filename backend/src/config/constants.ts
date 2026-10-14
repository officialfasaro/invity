export const AUTH_COOKIE_NAME = "fasaro_token";
export const GOOGLE_OAUTH_STATE_COOKIE = "fasaro_google_oauth_state";

export const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fasaro-jwt-super-secret-key-32chars";

export const KNOWN_DEMO_SLUGS = [
  "rian-sinta",
  "faisal-putri",
  "adirara",
  "royal",
  "syari",
  "rustic",
  "minimalist",
  "minang",
  "botanical",
  "versa-mekar",
  "velvet",
  "burgundy",
  "showcase",
  "raka-dan-ayu",
  "raka-ayu",
  "demo-raka-ayu",
  "demo-tema-4",
  "tema-4",
  "wedding-3d",
  "wedding-3d-template",
  "demo-wedding-3d",
  "demo-tema-5",
  "tema-5",
  "botanical-tema-01",
  "demo-botanical-tema-01",
  "editorial-tema-01",
  "demo-editorial-tema-01",
  "gothic-tema-01",
  "demo-gothic-tema-01",
  "royal-tema-01",
  "demo-royal-tema-01",
  "3d-tema-01",
  "demo-3d-tema-01",
];

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FOLDERS = new Set(["couples", "qris", "galleries", "proofs", "stories"]);

export const ALLOWED_MUSIC_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/aac",
  "audio/m4a",
]);
export const ALLOWED_MUSIC_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".aac", ".m4a"]);
export const MAX_MUSIC_SIZE = 15 * 1024 * 1024; // 15MB
