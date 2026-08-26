import { supabase } from "../lib/supabaseClient";

interface CrudOpts {
  orderBy?: string;
  ascending?: boolean;
}

/**
 * Generic CRUD factory for any Supabase table.
 * Returns { getAll, getById, create, update, remove } functions.
 */
export function createCrudService(table: string, opts: CrudOpts = {}) {
  const { orderBy = "sort_order", ascending = true } = opts;

  function ensureClient() {
    if (!supabase) {
      throw new Error(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
      );
    }
  }

  async function getAll() {
    ensureClient();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(orderBy, { ascending });

    if (error) throw error;
    return data;
  }

  async function getById(id: string) {
    ensureClient();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  async function create(record: Record<string, unknown>) {
    ensureClient();
    const { data, error } = await supabase
      .from(table)
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function update(id: string, changes: Record<string, unknown>) {
    ensureClient();
    const { data, error } = await supabase
      .from(table)
      .update(changes)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function remove(id: string) {
    ensureClient();
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
  }

  return { getAll, getById, create, update, remove };
}
