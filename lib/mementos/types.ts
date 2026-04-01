export type Memento = {
  id: number;
  createdAt: string;
  date: string;
  noteText: string;
  title: string;
  photoPath: string;
};

export type PersistedMementosState = {
  nextId: number;
  entries: Memento[];
};
