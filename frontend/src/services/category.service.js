import { publicClient } from '@core/api/publicClient';
import { ENDPOINTS } from '@core/api/endpoints';
import { extractList } from '@core/api/extractors';

export const categoryService = {
  async getAll() {
    try {
      const { data } = await publicClient.get(ENDPOINTS.categories);
      return extractList(data);
    } catch (err) {
      console.error('[categoryService] getAll failed:', err?.message);
      throw err;
    }
  },
};

export const { getAll: fetchCategories } = categoryService;
