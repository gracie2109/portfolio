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
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order(orderBy, { ascending });

  if (error) throw error;
  return (data ?? []) as T[];
}
