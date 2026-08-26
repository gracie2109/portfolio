import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface Opts {
  orderBy?: string;
  ascending?: boolean;
}

/**
 * Lightweight read-only hook for fetching public Supabase data.
 * Used by portfolio sections (no auth required — RLS allows public SELECT).
 */
export function usePublicData<T = unknown>(table: string, opts: Opts = {}) {
  const { orderBy = "sort_order", ascending = true } = opts;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      try {
        const { data: rows, error: err } = await supabase
          .from(table)
          .select("*")
          .order(orderBy, { ascending });

        if (err) throw err;
        if (!cancelled) setData(rows as T[]);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [table, orderBy, ascending]);

  return { data, loading, error };
}
