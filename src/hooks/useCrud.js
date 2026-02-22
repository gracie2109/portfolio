import { useState, useEffect, useCallback } from "react";

/**
 * Generic hook for CRUD operations against a service.
 *
 * @param {object} service — must expose { getAll, create, update, remove }
 * @returns {{ items, loading, error, refresh, addItem, updateItem, removeItem }}
 */
export function useCrud(service) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getAll();
      setItems(data);
    } catch (err) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (record) => {
      setError(null);
      try {
        const created = await service.create(record);
        setItems((prev) => [...prev, created]);
        return created;
      } catch (err) {
        setError(err.message || "Failed to create");
        throw err;
      }
    },
    [service]
  );

  const updateItem = useCallback(
    async (id, changes) => {
      setError(null);
      try {
        const updated = await service.update(id, changes);
        setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
        return updated;
      } catch (err) {
        setError(err.message || "Failed to update");
        throw err;
      }
    },
    [service]
  );

  const removeItem = useCallback(
    async (id) => {
      setError(null);
      try {
        await service.remove(id);
        setItems((prev) => prev.filter((it) => it.id !== id));
      } catch (err) {
        setError(err.message || "Failed to delete");
        throw err;
      }
    },
    [service]
  );

  return { items, loading, error, refresh, addItem, updateItem, removeItem };
}
