import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"
  );
}

/**
 * Browser client from @supabase/ssr — persists the session via cookies
 * instead of localStorage, so it's compatible with a server-rendered
 * client later (a matching createServerClient can read the same cookie).
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
