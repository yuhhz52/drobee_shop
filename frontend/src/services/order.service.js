import { publicClient, getAuthHeaders } from '@core/api/publicClient';
import { ENDPOINTS } from '@core/api/endpoints';

const withAuth = (config = {}) => ({
  ...config,
  headers: { ...config.headers, ...getAuthHeaders() },
});

export const orderService = {
  placeOrder(data) {
    return publicClient
      .post(ENDPOINTS.order, data, withAuth())
      .then((res) => res.data);
  },

  async confirmPayment(data) {
    try {
      const res = await publicClient.post(
        ENDPOINTS.orderUpdatePayment,
        data,
        withAuth()
      );
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },
};

export const { placeOrder: placeOrderAPI, confirmPayment: confirmPaymentAPI } =
  orderService;
