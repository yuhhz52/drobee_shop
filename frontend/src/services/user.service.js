import { publicClient, getAuthHeaders } from '@core/api/publicClient';
import httpClient from '@core/api/httpClient';
import { ENDPOINTS } from '@core/api/endpoints';

const withAuth = (config = {}) => ({
  ...config,
  headers: { ...config.headers, ...getAuthHeaders() },
});

export const userService = {
  fetchUserDetails() {
    return publicClient
      .get(ENDPOINTS.user.profile, withAuth())
      .then((res) => res.data);
  },

  deleteUser(id) {
    return publicClient
      .delete(ENDPOINTS.user.byId(id), withAuth())
      .then((res) => res.data);
  },

  addAddress(data) {
    return publicClient
      .post(ENDPOINTS.address, data, withAuth())
      .then((res) => res.data);
  },

  deleteAddress(id) {
    return publicClient
      .delete(ENDPOINTS.addressById(id), withAuth())
      .then((res) => res.data);
  },

  uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    return httpClient
      .post(ENDPOINTS.user.avatar, formData, {
        headers: {
          // Override default JSON header on httpClient
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => res.data);
  },

  fetchOrders() {
    return publicClient
      .get(ENDPOINTS.orderByUser, withAuth())
      .then((res) => res.data);
  },

  cancelOrder(id) {
    return publicClient
      .post(ENDPOINTS.orderCancel(id), null, withAuth())
      .then((res) => res.data);
  },
};

export const {
  fetchUserDetails,
  deleteUserAPI,
  addAddressAPI,
  deleteAddressAPI,
  uploadAvatar,
  fetchOrderAPI,
  cancelOrderAPI,
} = userService;
