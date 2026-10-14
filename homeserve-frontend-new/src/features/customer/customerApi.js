import axiosClient from '../../api/axiosClient';

export const customerApi = {
  getProfile: () => axiosClient.get('/customer/profile'),
  updateProfile: (formData) =>
    axiosClient.put('/customer/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  createAddress: (payload) => axiosClient.post('/customer/addresses', payload),
  getAddresses: () => axiosClient.get('/customer/addresses'),
  updateAddress: (id, payload) => axiosClient.put(`/customer/addresses/${id}`, payload),
  deleteAddress: (id) => axiosClient.delete(`/customer/addresses/${id}`),
  setDefaultAddress: (id) => axiosClient.patch(`/customer/addresses/${id}/default`),
};
