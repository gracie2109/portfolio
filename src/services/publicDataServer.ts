import { createClient } from "@/lib/supabase/server";

/**
 * Server Component equivalent of usePublicData — plain async fetch,
 * no React state/effect. Mirrors the same defaults and table shape.
 */
export async function getPublicData<T = unknown>(
  table: string,
  opts: { orderBy?: string; ascending?: boolean } = {}
): Promise<T[]> {
  const { orderBy = "sort_order", ascending = true } = opts;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order(orderBy, { ascending });

  if (error) throw error;
  return (data ?? []) as T[];
}
