import { publicClient } from '@core/api/publicClient';
import { ENDPOINTS } from '@core/api/endpoints';
import { extractList, extractTotalElements } from '@core/api/extractors';

export const productService = {
  async getAll({ categoryId, typeIds = [], name, newArrival,
                 minMaxSpeed, minRange, maxMotorPower, maxWeight,
                 minBatteryCapacity, minBatteryVoltage, removableBattery,
                 maxWheelSize, minMaxLoad, minMaxIncline,
                 page = 0, size = 12 } = {}) {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (categoryId) params.append('categoryId', categoryId);
    if (name) params.append('name', name);
    if (newArrival) params.append('newArrival', String(newArrival));
    if (minMaxSpeed != null) params.append('minMaxSpeed', String(minMaxSpeed));
    if (minRange != null) params.append('minRange', String(minRange));
    if (maxMotorPower != null) params.append('maxMotorPower', String(maxMotorPower));
    if (maxWeight != null) params.append('maxWeight', String(maxWeight));
    if (minBatteryCapacity != null) params.append('minBatteryCapacity', String(minBatteryCapacity));
    if (minBatteryVoltage != null) params.append('minBatteryVoltage', String(minBatteryVoltage));
    if (removableBattery != null) params.append('removableBattery', String(removableBattery));
    if (maxWheelSize != null) params.append('maxWheelSize', String(maxWheelSize));
    if (minMaxLoad != null) params.append('minMaxLoad', String(minMaxLoad));
    if (minMaxIncline != null) params.append('minMaxIncline', String(minMaxIncline));
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
      const params = new URLSearchParams({ slug, page: '0', size: '1' });
      const { data } = await publicClient.get(`${ENDPOINTS.products}?${params}`);
      const product = extractList(data)[0];
      return product || null;
    } catch (err) {
      console.error('[productService] getBySlug failed:', err?.message);
      throw err;
    }
  },
};

export const { getAll: getAllProducts, getBySlug: getProductBySlug } = productService;
