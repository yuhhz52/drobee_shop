import { v4 as uuidv4 } from 'uuid';
import { publicClient, getAuthHeaders } from '@core/api/publicClient';
import { ENDPOINTS } from '@core/api/endpoints';

const withAuth = (config = {}) => ({
  ...config,
  headers: { ...config.headers, ...getAuthHeaders() },
});

const unwrap = (res) => res.data?.result ?? res.data;

/**
 * Service dedicated to cart-based checkout.
 *
 * <p>This is the only HTTP entry point for placing a cart-derived order.
 * The backend endpoint is {@code POST /api/checkout/cart}, which clears
 * the cart only after stock has been deducted and the order is persisted.
 *
 * <p>Sends an idempotency key on every call so accidental double-submits
 * collapse to the same order.
 */
export const cartCheckoutService = {
  /**
   * @param {{
   *   cartId: string,
   *   addressId: string,
   *   paymentMethod: 'COD'|'VNPAY'|'CARD',
   *   couponCode?: string,
   * }} payload
   */
  checkout(payload) {
    const idempotencyKey = payload.idempotencyKey || uuidv4();
    return publicClient
      .post(
        ENDPOINTS.checkoutCart,
        { ...payload, idempotencyKey },
        withAuth(),
      )
      .then((res) => unwrap(res));
  },
};

export const { checkout: checkoutFromCartAPI } = cartCheckoutService;
