// Storage key for the Buy Now single-item payload.
//
// Stored in sessionStorage (cleared when the tab is closed) so a Buy Now
// session doesn't leak across browser sessions. Read once on the Buy Now
// checkout page; cleared by OrderConfirmed after success.
export const DIRECT_CHECKOUT_STORAGE_KEY = 'directCheckoutItem';

/**
 * Read the Buy Now payload from sessionStorage, or null if absent / invalid.
 *
 * @returns {null | {
 *   productId: string,
 *   thumbnail: string,
 *   name: string,
 *   variant: { id: string, variantName?: string, color?: string },
 *   quantity: number,
 *   price: number,
 * }}
 */
export const readDirectCheckoutItem = () => {
  try {
    const raw = sessionStorage.getItem(DIRECT_CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.productId) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writeDirectCheckoutItem = (item) => {
  sessionStorage.setItem(DIRECT_CHECKOUT_STORAGE_KEY, JSON.stringify(item));
};

export const clearDirectCheckoutItem = () => {
  sessionStorage.removeItem(DIRECT_CHECKOUT_STORAGE_KEY);
};
