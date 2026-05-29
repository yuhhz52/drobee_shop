import axios from 'axios';
import { env } from '@core/config/env';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from '@shared/utils/jwt-helper';

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

httpClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (originalRequest.url?.endsWith('/logout')) {
      clearTokens();
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(err);
      }

      try {
        const refreshResponse = await axios.post(
          `${env.apiBaseUrl}/api/auth/refresh`,
          { refreshToken }
        );
        const { token, refreshToken: newRefreshToken } = refreshResponse.data;
        saveTokens(token, newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export default httpClient;
