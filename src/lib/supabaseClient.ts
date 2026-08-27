import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Browser client from @supabase/ssr — persists the session via cookies
 * instead of localStorage, so it's compatible with a server-rendered
 * client later (a matching createServerClient can read the same cookie).
 *
 * `null` when the env vars aren't configured (e.g. local dev without a
 * `.env`, or a build without secrets) — this client only backs the
 * admin CMS (see AuthProvider / crudService), which should degrade to a
 * "not configured" state instead of crashing the whole admin bundle.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createBrowserClient(supabaseUrl, supabaseAnonKey)
    : null;
