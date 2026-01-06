import { useCallback, useEffect, useMemo, useState } from "react";
import { createResidentRepository } from "../services/residentRepository";

/**
 * PUBLIC_INTERFACE
 * Provides resident list state and CRUD operations.
 */
export function useResidents() {
  const repo = useMemo(() => createResidentRepository(), []);
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState([]);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await repo.init();
      const list = await repo.list();
      setResidents(list);
    } catch (err) {
      setError(err?.message || "Failed to load residents.");
    } finally {
      setLoading(false);
    }
  }, [repo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createResident = useCallback(
    async (input) => {
      const created = await repo.create(input);
      await refresh();
      return created;
    },
    [repo, refresh]
  );

  const updateResident = useCallback(
    async (id, input) => {
      const updated = await repo.update(id, input);
      await refresh();
      return updated;
    },
    [repo, refresh]
  );

  const deleteResident = useCallback(
    async (id) => {
      await repo.remove(id);
      await refresh();
      return true;
    },
    [repo, refresh]
  );

  const getResidentById = useCallback(
    async (id) => {
      return repo.getById(id);
    },
    [repo]
  );

  return {
    loading,
    residents,
    error,
    refresh,
    createResident,
    updateResident,
    deleteResident,
    getResidentById
  };
}
