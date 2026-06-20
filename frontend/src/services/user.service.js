import httpClient from '@core/api/httpClient';
import { ENDPOINTS } from '@core/api/endpoints';

const unwrap = (res) => res.data?.result ?? res.data;

export const userService = {
  fetchUserDetails() {
    return httpClient.get(ENDPOINTS.user.profile).then((res) => res.data);
  },

  deleteUser(id) {
    return httpClient.delete(ENDPOINTS.user.byId(id)).then((res) => res.data);
  },

  addAddress(data) {
    return httpClient.post(ENDPOINTS.address, data).then(unwrap);
  },

  deleteAddress(id) {
    return httpClient.delete(ENDPOINTS.addressById(id)).then(unwrap);
  },

  updateAddress(id, data) {
    return httpClient.put(ENDPOINTS.addressById(id), data).then(unwrap);
  },

  setDefaultAddress(id) {
    return httpClient.put(`${ENDPOINTS.addressById(id)}/default`).then(unwrap);
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
    return httpClient.get(ENDPOINTS.orderByUser).then(unwrap);
  },

  cancelOrder(id) {
    return httpClient.post(ENDPOINTS.orderCancel(id)).then(unwrap);
  },
};

export const fetchUserDetails = userService.fetchUserDetails.bind(userService);
export const deleteUserAPI = userService.deleteUser.bind(userService);
export const addAddressAPI = userService.addAddress.bind(userService);
export const deleteAddressAPI = userService.deleteAddress.bind(userService);
export const updateAddressAPI = userService.updateAddress.bind(userService);
export const setDefaultAddressAPI = userService.setDefaultAddress.bind(userService);
export const uploadAvatar = userService.uploadAvatar.bind(userService);
export const fetchOrderAPI = userService.fetchOrders.bind(userService);
export const cancelOrderAPI = userService.cancelOrder.bind(userService);
