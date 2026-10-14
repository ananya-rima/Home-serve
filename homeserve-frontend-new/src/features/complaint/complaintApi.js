import axiosClient from '../../api/axiosClient';

export const complaintApi = {
  create: (payload) => axiosClient.post('/complaints', payload),
  getMyComplaints: () => axiosClient.get('/complaints/my-complaints'),
  getById: (id) => axiosClient.get(`/complaints/${id}`),
};
