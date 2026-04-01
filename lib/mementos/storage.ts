import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

import type { Memento, PersistedMementosState } from "./types";

const STORAGE_KEY = "@remember_the_time_mementos_v1";
const MEMENTOS_DIR = "mementos_media";

async function loadState(): Promise<PersistedMementosState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { nextId: 1, entries: [] };
  }
  try {
    const parsed = JSON.parse(raw) as PersistedMementosState;
    if (
      typeof parsed.nextId !== "number" ||
      !Array.isArray(parsed.entries)
    ) {
      return { nextId: 1, entries: [] };
    }
    return parsed;
  } catch {
    return { nextId: 1, entries: [] };
  }
}

async function saveState(state: PersistedMementosState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function mementosDirectoryUri(): string {
  const base = FileSystem.documentDirectory;
  if (!base) {
    throw new Error("Document directory unavailable");
  }
  return `${base}${MEMENTOS_DIR}`;
}

async function ensureMementosDir(): Promise<void> {
  const dir = mementosDirectoryUri();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

export async function copyPhotoToMementos(
  tempUri: string,
  id: number,
): Promise<string> {
  await ensureMementosDir();
  const dest = `${mementosDirectoryUri()}/${id}.jpg`;
  await FileSystem.copyAsync({ from: tempUri, to: dest });
  return dest;
}

export async function deletePhotoFile(photoPath: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(photoPath);
    if (info.exists) {
      await FileSystem.deleteAsync(photoPath, { idempotent: true });
    }
  } catch {
    // best effort
  }
}

export async function fetchMementos(): Promise<Memento[]> {
  const { entries } = await loadState();
  return [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function createMemento(
  tempPhotoUri: string,
  title: string,
  noteText: string,
): Promise<Memento> {
  const state = await loadState();
  const id = state.nextId;
  const createdAt = new Date().toISOString();
  const photoPath = await copyPhotoToMementos(tempPhotoUri, id);
  const entry: Memento = {
    id,
    createdAt,
    date: createdAt,
    noteText,
    title: title.trim(),
    photoPath,
  };
  const next: PersistedMementosState = {
    nextId: id + 1,
    entries: [...state.entries, entry],
  };
  await saveState(next);
  return entry;
}

export async function updateMemento(
  id: number,
  patch: { title?: string; noteText?: string; date?: string },
): Promise<Memento | null> {
  const state = await loadState();
  let updated: Memento | null = null;
  const entries = state.entries.map((e) => {
    if (e.id !== id) return e;
    updated = {
      ...e,
      ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
      ...(patch.noteText !== undefined ? { noteText: patch.noteText } : {}),
      ...(patch.date !== undefined ? { date: patch.date } : {}),
    };
    return updated;
  });
  if (!updated) return null;
  await saveState({ ...state, entries });
  return updated;
}

export async function removeMemento(id: number): Promise<void> {
  const state = await loadState();
  const found = state.entries.find((e) => e.id === id);
  if (found) {
    await deletePhotoFile(found.photoPath);
  }
  await saveState({
    ...state,
    entries: state.entries.filter((e) => e.id !== id),
  });
}
