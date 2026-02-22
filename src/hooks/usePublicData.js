import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Lightweight read-only hook for fetching public Supabase data.
 * Used by portfolio sections (no auth required — RLS allows public SELECT).
 *
 * @param {string} table — Supabase table name
 * @param {object} opts
 * @param {string} opts.orderBy — column to order by
 * @param {boolean} opts.ascending — sort direction (default true)
 */
export function usePublicData(table, opts = {}) {
  const { orderBy = "sort_order", ascending = true } = opts;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetch() {
      try {
        const { data: rows, error: err } = await supabase
          .from(table)
          .select("*")
          .order(orderBy, { ascending });

        if (err) throw err;
        if (!cancelled) setData(rows);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [table, orderBy, ascending]);

  return { data, loading, error };
}
