import { publicClient } from '@core/api/publicClient';
import httpClient from '@core/api/httpClient';
import { ENDPOINTS } from '@core/api/endpoints';
import { saveTokens, clearTokens, getRefreshToken } from '@shared/utils/jwt-helper';

export const authService = {
  async login(body) {
    const { data } = await publicClient.post(ENDPOINTS.auth.login, body);
    const token = data.accessToken || data.token;
    if (token) saveTokens(token, data.refreshToken);
    return data;
  },

  register(body) {
    return publicClient.post(ENDPOINTS.auth.register, body).then((res) => res.data);
  },

  verify(body) {
    return publicClient.post(ENDPOINTS.auth.verify, body).then((res) => res.data);
  },

  getProfile() {
    return httpClient.get(ENDPOINTS.auth.profile).then((res) => res.data);
  },

  async logout() {
    try {
      await httpClient.post(ENDPOINTS.auth.logout, {
        refreshToken: getRefreshToken(),
      });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      clearTokens();
      window.location.href = '/';
    }
  },
};

export const {
  login: loginAPI,
  register: registerAPI,
  verify: verifyAPI,
  getProfile: getProfileAPI,
  logout: logoutAPI,
} = authService;
