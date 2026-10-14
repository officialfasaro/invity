import crypto from "crypto";

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email?: boolean;
}

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

export function isGoogleAuthConfigured(): boolean {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return Boolean(clientId && clientSecret && clientId.trim() !== "" && clientSecret.trim() !== "");
}

export function getBaseUrl(requestUrl?: string): string {
  if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.trim() !== "") {
    return process.env.NEXTAUTH_URL.trim().replace(/\/$/, "");
  }
  if (requestUrl) {
    try {
      const parsed = new URL(requestUrl);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      // Fallback below
    }
  }
  return "http://localhost:3001";
}

export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getGoogleOAuthUrl(state: string, requestUrl?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const baseUrl = getBaseUrl(requestUrl);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  requestUrl?: string
): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const baseUrl = getBaseUrl(requestUrl);
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal menukar authorization code Google: ${errorText}`);
  }

  return response.json() as Promise<GoogleTokenResponse>;
}

export async function getGoogleUserProfile(accessToken: string): Promise<GoogleUserProfile> {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal mengambil data profil Google: ${errorText}`);
  }

  return response.json() as Promise<GoogleUserProfile>;
}
