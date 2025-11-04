import { post } from '@/lib/http';
import type { LoginPayload, RegisterPayload, User } from '@/types';

export async function login(payload: LoginPayload) {
  return post<User>('/api/auth/login', payload);
}

export async function register(payload: RegisterPayload) {
  return post<User>('/api/auth/register', payload);
}

