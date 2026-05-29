import axios from 'axios';
import { env } from '@core/config/env';
import { getAccessToken } from '@shared/utils/jwt-helper';

/** Unauthenticated or manually-headered requests */
export const publicClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

export const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default publicClient;
