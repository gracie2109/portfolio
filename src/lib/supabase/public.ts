import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for reading public, unauthenticated data (homepage
 * sections: experiences, skills, projects). Deliberately does NOT read
 * request cookies like lib/supabase/server.ts's createClient() does —
 * that cookie read forces every route calling it into dynamic
 * (server-rendered on demand) rendering. This client relies on RLS
 * policies permitting anon SELECT on the public tables, so the
 * homepage can be statically rendered.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
