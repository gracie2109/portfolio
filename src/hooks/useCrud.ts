import { useState, useEffect, useCallback } from "react";

interface CrudService<T> {
  getAll: () => Promise<T[]>;
  create: (record: Record<string, unknown>) => Promise<T>;
  update: (id: string, changes: Record<string, unknown>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

interface WithId {
  id: string;
}

/**
 * Generic hook for CRUD operations against a service.
 */
export function useCrud<T extends WithId>(service: CrudService<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getAll();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (record: Record<string, unknown>) => {
      setError(null);
      try {
        const created = await service.create(record);
        setItems((prev) => [...prev, created]);
        return created;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create");
        throw err;
      }
    },
    [service]
  );

  const updateItem = useCallback(
    async (id: string, changes: Record<string, unknown>) => {
      setError(null);
      try {
        const updated = await service.update(id, changes);
        setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
        return updated;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update");
        throw err;
      }
    },
    [service]
  );

  const removeItem = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await service.remove(id);
        setItems((prev) => prev.filter((it) => it.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete");
        throw err;
      }
    },
    [service]
  );

  return { items, loading, error, refresh, addItem, updateItem, removeItem };
}
