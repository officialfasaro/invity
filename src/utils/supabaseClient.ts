import { createClient, SupabaseClient } from "@supabase/supabase-js";

const rawSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://rvsdydyvobskkrngtbwl.supabase.co";

const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    return clientInstance;
  } catch (error) {
    console.error("Gagal menginisialisasi Supabase Client:", error);
    return null;
  }
}
