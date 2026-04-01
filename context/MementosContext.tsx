import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Memento } from "@/lib/mementos/types";
import * as storage from "@/lib/mementos/storage";

type MementosContextValue = {
  mementos: Memento[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addMemento: (
    tempPhotoUri: string,
    title: string,
    noteText: string,
  ) => Promise<void>;
  updateMemento: (
    id: number,
    patch: { title: string; noteText: string; date: string },
  ) => Promise<void>;
  deleteMemento: (id: number) => Promise<void>;
};

const MementosContext = createContext<MementosContextValue | null>(null);

export function MementosProvider({ children }: { children: React.ReactNode }) {
  const [mementos, setMementos] = useState<Memento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const list = await storage.fetchMementos();
      setMementos(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load mementos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addMemento = useCallback(
    async (tempPhotoUri: string, title: string, noteText: string) => {
      await storage.createMemento(tempPhotoUri, title, noteText);
      await reload();
    },
    [reload],
  );

  const updateMemento = useCallback(
    async (
      id: number,
      patch: { title: string; noteText: string; date: string },
    ) => {
      await storage.updateMemento(id, patch);
      await reload();
    },
    [reload],
  );

  const deleteMemento = useCallback(
    async (id: number) => {
      await storage.removeMemento(id);
      await reload();
    },
    [reload],
  );

  const value = useMemo(
    () => ({
      mementos,
      loading,
      error,
      reload,
      addMemento,
      updateMemento,
      deleteMemento,
    }),
    [
      mementos,
      loading,
      error,
      reload,
      addMemento,
      updateMemento,
      deleteMemento,
    ],
  );

  return (
    <MementosContext.Provider value={value}>
      {children}
    </MementosContext.Provider>
  );
}

export function useMementos() {
  const ctx = useContext(MementosContext);
  if (!ctx) {
    throw new Error("useMementos must be used within MementosProvider");
  }
  return ctx;
}
