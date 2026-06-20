/**
 * Vietnam Administrative Division API Service
 * Uses Province Open API v2 - Free API after July 2025 reorganization
 * Source: https://provinces.open-api.vn/api/v2/
 */

const BASE_URL = 'https://provinces.open-api.vn/api/v2';

let cachedData = null;
let cachePromise = null;

export const vietnamRegionService = {
  async fetchAllWithWards() {
    if (cachedData) return cachedData;
    if (cachePromise) return cachePromise;

    cachePromise = fetch(`${BASE_URL}/?depth=2`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch regions');
        return r.json();
      })
      .then(data => {
        cachedData = data;
        return data;
      })
      .catch(err => {
        cachePromise = null;
        throw err;
      });

    return cachePromise;
  },

  async fetchProvinces() {
    const data = await this.fetchAllWithWards();
    return data.map(p => ({
      code: p.code,
      name: p.name,
      codename: p.codename,
      division_type: p.division_type,
      phone_code: p.phone_code
    }));
  },

  async fetchWards(provinceCode) {
    const data = await this.fetchAllWithWards();
    const province = data.find(p => p.code === Number(provinceCode));
    return province?.wards || [];
  },

  clearCache() {
    cachedData = null;
    cachePromise = null;
  },

  searchProvinces(provinces, query) {
    if (!query) return provinces.slice(0, 10);
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return provinces
      .filter(p => {
        const name = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return name.includes(q) || p.name.toLowerCase().includes(query.toLowerCase());
      })
      .slice(0, 10);
  },

  searchWards(wards, query) {
    if (!query) return wards.slice(0, 10);
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return wards
      .filter(w => {
        const name = w.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return name.includes(q) || w.name.toLowerCase().includes(query.toLowerCase());
      })
      .slice(0, 10);
  }
};

export default vietnamRegionService;
