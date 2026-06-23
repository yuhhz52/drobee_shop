import { publicClient, getAuthHeaders } from '@core/api/publicClient';
import { ENDPOINTS } from '@core/api/endpoints';

const withAuth = (config = {}) => ({
  ...config,
  headers: { ...config.headers, ...getAuthHeaders() },
});

const unwrap = (res) => res.data?.result ?? res.data;

export const orderService = {
  placeOrder(data) {
    return publicClient
      .post(ENDPOINTS.order, data, withAuth())
      .then((res) => unwrap(res));
  },

  checkoutFromCart(data) {
    return publicClient
      .post(ENDPOINTS.orderCheckout, data, withAuth())
      .then((res) => unwrap(res));
  },

  // Direct checkout for Buy Now flow - doesn't require cartId
  checkoutDirect(data) {
    return publicClient
      .post(ENDPOINTS.orderDirect, data, withAuth())
      .then((res) => unwrap(res));
  },

  async confirmPayment(data) {
    try {
      const res = await publicClient.post(
        ENDPOINTS.orderUpdatePayment,
        data,
        withAuth()
      );
      return unwrap(res);
    } catch (err) {
      throw err.response?.data || err;
    }
  },
};

export const {
  placeOrder: placeOrderAPI,
  checkoutFromCart: checkoutFromCartAPI,
  checkoutDirect: checkoutDirectAPI,
  confirmPayment: confirmPaymentAPI
} = orderService;
