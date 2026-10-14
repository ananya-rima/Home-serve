import axiosClient from '../../api/axiosClient';

export const reviewApi = {
  create: (payload) => axiosClient.post('/reviews', payload),
  getByProvider: (providerId) => axiosClient.get(`/providers/${providerId}/reviews`),
  update: (id, payload) => axiosClient.put(`/reviews/${id}`, payload),
  remove: (id) => axiosClient.delete(`/reviews/${id}`),
};
