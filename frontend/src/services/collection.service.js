import { publicClient } from '@core/api/publicClient';
import { ENDPOINTS } from '@core/api/endpoints';

export const collectionService = {
  async getAll() {
    try {
      const { data } = await publicClient.get(ENDPOINTS.collections);
      return data?.result || [];
    } catch (err) {
      console.error('[collectionService] getAll failed:', err?.message);
      throw err;
    }
  },

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

export const { getAll: fetchCollections, getBySlug: fetchCollectionBySlug } = collectionService;
