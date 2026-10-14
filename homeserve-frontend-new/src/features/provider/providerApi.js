import axiosClient from '../../api/axiosClient';

export const providerApi = {
  
  discoverProviders: (params) => axiosClient.get('/providers', { params }),
  getProviderDetails: (id) => axiosClient.get(`/providers/${id}`),
  getPublicAvailability: (id, date) => axiosClient.get(`/providers/${id}/availability`, { params: { date } }),

 
  getProfile: () => axiosClient.get('/provider/profile'),
  
  updateProfile: (payload) =>
    payload instanceof FormData
      ? axiosClient.put('/provider/profile', payload, { headers: { 'Content-Type': 'multipart/form-data' } })
      : axiosClient.put('/provider/profile', payload),

  addService: (payload) => axiosClient.post('/provider/services', payload),
  getMyServices: () => axiosClient.get('/provider/services'),
  updateMyService: (id, payload) => axiosClient.put(`/provider/services/${id}`, payload),
  removeMyService: (id) => axiosClient.delete(`/provider/services/${id}`),

  setAvailability: (availability) => axiosClient.put('/provider/availability', { availability }),
  getAvailability: () => axiosClient.get('/provider/availability'),

  getBookingRequests: () => axiosClient.get('/provider/bookings/requests'),
  getMyBookings: (params) => axiosClient.get('/provider/bookings', { params }),

  getEarnings: () => axiosClient.get('/provider/earnings'),
  getMyReviews: () => axiosClient.get('/provider/reviews'),
};
