import { supabase } from "../lib/supabaseClient";

/**
 * Generic CRUD factory for any Supabase table.
 * Returns { getAll, getById, create, update, remove } functions.
 *
 * @param {string} table — table name in Supabase
 * @param {object} opts
 * @param {string} opts.orderBy — column to order by (default: "sort_order")
 * @param {boolean} opts.ascending — ascending order (default: true)
 */
export function createCrudService(table, opts = {}) {
  const { orderBy = "sort_order", ascending = true } = opts;

  function ensureClient() {
    if (!supabase) {
      throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env");
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

  async function getById(id) {
    ensureClient();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  async function create(record) {
    ensureClient();
    const { data, error } = await supabase
      .from(table)
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async function update(id, changes) {
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

  async function remove(id) {
    ensureClient();
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
  }

  return { getAll, getById, create, update, remove };
}
