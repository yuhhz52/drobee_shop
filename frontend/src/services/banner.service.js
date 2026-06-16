import { publicClient } from '@core/api/publicClient';
import { ENDPOINTS } from '@core/api/endpoints';

export const bannerService = {
  async getActive() {
    try {
      const { data } = await publicClient.get(ENDPOINTS.bannersActive);
      return data?.result || [];
    } catch (err) {
      console.error('[bannerService] getActive failed:', err?.message);
      return [];
    }
  },
};

export const { getActive: fetchActiveBanners } = bannerService;
