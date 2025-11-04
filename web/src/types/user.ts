export interface User {
  id: number;
  username: string;
  email?: string;
  password?: string;
  avatarIndex?: number;
  level?: number;
  experiencePoints?: number;
  createdAt?: string;
  updatedAt?: string | null;
  lastLogin?: string | null;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  avatarIndex: number;
}

