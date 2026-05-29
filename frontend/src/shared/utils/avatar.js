import { env } from '@core/config/env';

const FALLBACK_API_BASE_URL = 'http://localhost:8080';

export const resolveAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) return '';
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }
  if (avatarUrl.startsWith('/')) {
    const base = env.apiBaseUrl || FALLBACK_API_BASE_URL;
    return `${base}${avatarUrl}`;
  }
  return avatarUrl;
};

export const buildUserInitial = (userInfo = {}) => {
  const first = userInfo?.firstName?.trim()?.[0] || '';
  const last = userInfo?.lastName?.trim()?.[0] || '';
  return `${first}${last}`.toUpperCase() || 'U';
};
