import { publicClient } from '@core/api/publicClient';
import { ENDPOINTS } from '@core/api/endpoints';

export const collectionService = {
  async getBySlug(slug) {
    try {
      const { data } = await publicClient.get(ENDPOINTS.collectionBySlug(slug));
      return data?.result || null;
    } catch (err) {
      if (err?.response?.status === 404) {
        return null;
      }
      console.error('[collectionService] getBySlug failed:', err?.message);
      throw err;
    }
  },
};

export const { getBySlug: fetchCollectionBySlug } = collectionService;
