import { v4 as uuidv4 } from 'uuid';
import { publicClient, getAuthHeaders } from '@core/api/publicClient';
import { ENDPOINTS } from '@core/api/endpoints';

const withAuth = (config = {}) => ({
  ...config,
  headers: { ...config.headers, ...getAuthHeaders() },
});

const unwrap = (res) => res.data?.result ?? res.data;

/**
 * Service dedicated to Buy Now / direct checkout.
 *
 * <p>This is the only HTTP entry point for placing a Buy Now order. The
 * backend endpoint is {@code POST /api/checkout/direct}, which never reads,
 * writes, or clears the user's cart.
 *
 * <p>Sends an idempotency key on every call so accidental double-submits
 * collapse to the same order.
 */
export const directCheckoutService = {
  /**
   * @param {{
   *   addressId: string,
   *   paymentMethod: 'COD'|'VNPAY'|'CARD',
   *   items: Array<{ productId: string, productVariantId: string|null, quantity: number }>
   * }} payload
   */
  checkout(payload) {
    const idempotencyKey = payload.idempotencyKey || uuidv4();
    return publicClient
      .post(
        ENDPOINTS.checkoutDirect,
        { ...payload, idempotencyKey },
        withAuth(),
      )
      .then((res) => unwrap(res));
  },
};

export const { checkout: checkoutDirectAPI } = directCheckoutService;
