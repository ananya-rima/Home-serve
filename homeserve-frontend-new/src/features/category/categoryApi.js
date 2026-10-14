import axiosClient from '../../api/axiosClient';

export const categoryApi = {
  getAll: (params) => axiosClient.get('/categories', { params }),
  getById: (id) => axiosClient.get(`/categories/${id}`),
  create: (formData) =>
    axiosClient.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    axiosClient.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => axiosClient.delete(`/categories/${id}`),
  toggleStatus: (id) => axiosClient.patch(`/categories/${id}/toggle-status`),
};
