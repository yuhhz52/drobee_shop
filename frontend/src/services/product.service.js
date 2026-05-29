import { publicClient } from '@core/api/publicClient';
import { ENDPOINTS } from '@core/api/endpoints';
import { extractList, extractTotalElements } from '@core/api/extractors';

export const productService = {
  async getAll({ categoryId, typeIds = [], name, newArrival, page = 0, size = 12 } = {}) {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (categoryId) params.append('categoryId', categoryId);
    if (name) params.append('name', name);
    if (newArrival) params.append('newArrival', String(newArrival));
    (Array.isArray(typeIds) ? typeIds : []).forEach((id) =>
      params.append('typeIds', id)
    );

    try {
      const { data, headers } = await publicClient.get(
        `${ENDPOINTS.products}?${params}`
      );
      const products = extractList(data);
      return {
        products,
        totalElements: extractTotalElements(headers, products.length),
      };
    } catch (err) {
      console.error('[productService] getAll failed:', err?.message);
      throw err;
    }
  },

  async getBySlug(slug) {
    try {
      const { data } = await publicClient.get(`${ENDPOINTS.products}?slug=${slug}`);
      const product = extractList(data)[0];
      return product || null;
    } catch (err) {
      console.error('[productService] getBySlug failed:', err?.message);
      throw err;
    }
  },
};

export const { getAll: getAllProducts, getBySlug: getProductBySlug } = productService;
