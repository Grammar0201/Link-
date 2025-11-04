import { create } from 'zustand';
import type { User } from '@/types';

export type SessionUser = Pick<User, 'id' | 'username' | 'email' | 'avatarIndex' | 'lastLogin'>;

type SessionState = {
  user: SessionUser | null;
  setUser: (u: User) => void;
  clear: () => void;
};

const STORAGE_KEY = 'linknote_user';

function toSessionUser(u: User): SessionUser {
  const { id, username, email, avatarIndex, lastLogin } = u;
  return { id, username, email, avatarIndex, lastLogin };
}

function load(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export const useSessionStore = create<SessionState>((set) => ({
  user: load(),
  setUser: (u) => {
    const next = toSessionUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ user: next });
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ user: null });
  },
}));
