import axiosClient from '../../api/axiosClient';

export const bookingApi = {
  create: (payload) => axiosClient.post('/bookings', payload),
  getMyBookings: (params) => axiosClient.get('/bookings/my-bookings', { params }),
  getById: (id) => axiosClient.get(`/bookings/${id}`),
  accept: (id) => axiosClient.patch(`/bookings/${id}/accept`),
  reject: (id) => axiosClient.patch(`/bookings/${id}/reject`),
  updateStatus: (id, status) => axiosClient.patch(`/bookings/${id}/status`, { status }),
  cancel: (id) => axiosClient.patch(`/bookings/${id}/cancel`),
};
