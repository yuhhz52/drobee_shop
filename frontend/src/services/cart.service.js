import httpClient from '@core/api/httpClient';
import { ENDPOINTS } from '@core/api/endpoints';
import { getCartSessionId, setCartSessionId } from '@shared/utils/cart-session';

const SESSION_KEY = 'cart_session';

/** Read session ID directly from browser cookie (httpOnly=false). */
const readSessionFromCookie = () => {
  const match = document.cookie.match(new RegExp(`(^| )${SESSION_KEY}=([^;]+)`));
  return match?.[2] || null;
};

export const cartService = {

  getCart() {
    return httpClient.get(ENDPOINTS.cart).then((res) => res.data);
  },

  addItem(payload) {
    console.log('[cartService.addItem] sending:', payload);
    return httpClient
      .post(ENDPOINTS.cartItems, payload)
      .then((res) => {
        console.log('[cartService.addItem] response:', res.data);
        // Backend returns CartResponse with items array
        const cartResponse = res.data;
        // Set session cookie if present in response headers
        if (res.headers?.['set-cookie']) {
          setCartSessionId(res);
        }
        return cartResponse;
      })
      .catch((err) => {
        console.error('[cartService.addItem] error:', err.response?.data || err.message);
        throw err;
      });
  },

  updateQuantity(itemId, quantity) {
    return httpClient
      .patch(ENDPOINTS.cartItem(itemId), { quantity })
      .then((res) => res.data)
      .catch((err) => {
        console.error('[cartService.updateQuantity] error:', err.response?.data || err.message);
        throw err;
      });
  },

  removeItem(itemId) {
    return httpClient.delete(ENDPOINTS.cartItem(itemId)).then((res) => res.data);
  },

  clearCart() {
    return httpClient.delete(ENDPOINTS.cart).then((res) => res.data);
  },

  mergeCart() {
    return httpClient
      .post(ENDPOINTS.cartMerge, {})
      .then((res) => {
        localStorage.removeItem('cart');
        return res.data;
      });
  },
};
