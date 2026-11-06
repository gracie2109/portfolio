import { createPublicClient } from "@/lib/supabase/public";

/**
 * Server Component equivalent of usePublicData — plain async fetch,
 * no React state/effect. Mirrors the same defaults and table shape.
 *
 * Uses the cookie-free public client (not lib/supabase/server.ts) so
 * the homepage sections calling this can be statically rendered.
 */
export async function getPublicData<T = unknown>(
  table: string,
  opts: { orderBy?: string; ascending?: boolean } = {}
): Promise<T[]> {
  const { orderBy = "sort_order", ascending = true } = opts;

  // Vercel Preview deployments may not have the Supabase env vars; render
  // empty sections instead of failing the whole build. Production still
  // throws on real query errors below.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn(`[publicData] Supabase env vars missing — "${table}" rendered empty.`);
    return [];
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order(orderBy, { ascending });

  if (error) throw error;
  return (data ?? []) as T[];
}
