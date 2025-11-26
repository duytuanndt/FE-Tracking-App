import { api } from '@/lib/axios';
import { RefreshTokenResponse } from '@/entities/auth';

export const getProfile = async () => {
  const data = await api.get('/auth/profile');
  return data;
};

export const logout = async () => {
  const data = await api.get('/auth/logout');
  return data;
};

export const refreshToken = async (refresh_token: string) => {
  const config = refresh_token
    ? { headers: { Authorization: `Bearer ${refresh_token}` } }
    : undefined;
  const res = await api.post<RefreshTokenResponse>(
    '/auth/refresh',
    undefined,
    config,
  );
  return res;
};
