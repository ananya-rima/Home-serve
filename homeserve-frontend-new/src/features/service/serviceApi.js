import axiosClient from '../../api/axiosClient';

export const serviceApi = {
  getAll: (params) => axiosClient.get('/services', { params }),
  getById: (id) => axiosClient.get(`/services/${id}`),
  create: (formData) =>
    axiosClient.post('/services', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    axiosClient.put(`/services/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => axiosClient.delete(`/services/${id}`),
};
