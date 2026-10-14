import { createClient, SupabaseClient } from "@supabase/supabase-js";

const rawSupabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://aummjkryzfezlyikbnpm.supabase.co";
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

export const SUPABASE_STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET || "wedding-assets";

let cachedSupabaseClient: SupabaseClient | null = null;
let cachedAdminClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!cachedSupabaseClient) {
    cachedSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return cachedSupabaseClient;
}

export function getSupabaseAdminClient(): SupabaseClient {
  if (!cachedAdminClient) {
    cachedAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cachedAdminClient;
}

export function getPublicStorageUrl(
  path: string,
  bucket = SUPABASE_STORAGE_BUCKET
): string {
  const supabase = getSupabaseAdminClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export interface SignedUploadUrlResult {
  signedUrl: string;
  token: string;
  path: string;
}

export async function generateSignedUploadUrl(
  path: string,
  options?: { upsert?: boolean },
  bucket = SUPABASE_STORAGE_BUCKET
): Promise<SignedUploadUrlResult> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path, { upsert: options?.upsert ?? false });

  if (error || !data) {
    throw new Error(
      `Gagal membuat upload URL Supabase: ${error?.message || "Unknown error"}`
    );
  }

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
  };
}

export async function deleteStorageFile(
  paths: string | string[],
  bucket = SUPABASE_STORAGE_BUCKET
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const pathList = Array.isArray(paths) ? paths : [paths];
  const { error } = await supabase.storage.from(bucket).remove(pathList);

  if (error) {
    throw new Error(`Gagal menghapus file Supabase Storage: ${error.message}`);
  }
}
