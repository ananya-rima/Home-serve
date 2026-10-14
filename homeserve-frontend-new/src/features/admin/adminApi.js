import axiosClient from '../../api/axiosClient';

export const adminApi = {
  
  getDashboard: () => axiosClient.get('/admin/dashboard'),
  getRevenue: () => axiosClient.get('/admin/revenue'),
  getTopServices: (params) => axiosClient.get('/admin/top-services', { params }),
  getTopProviders: (params) => axiosClient.get('/admin/top-providers', { params }),
  getProviderRatings: () => axiosClient.get('/admin/provider-ratings'),
  getProvidersWithServices: () => axiosClient.get('/admin/providers-with-services'),

  
  getCustomers: (params) => axiosClient.get('/admin/customers', { params }),
  getCustomerDetails: (id) => axiosClient.get(`/admin/customers/${id}`),
  toggleCustomerBlock: (id) => axiosClient.patch(`/admin/customers/${id}/toggle-block`),

  
  getProviders: (params) => axiosClient.get('/admin/providers', { params }),
  getProviderDetails: (id) => axiosClient.get(`/admin/providers/${id}`),
  approveProvider: (id) => axiosClient.patch(`/admin/providers/${id}/approve`),
  rejectProvider: (id) => axiosClient.patch(`/admin/providers/${id}/reject`),
  toggleProviderBlock: (id) => axiosClient.patch(`/admin/providers/${id}/toggle-block`),

  
  getAllBookings: (params) => axiosClient.get('/admin/bookings', { params }),
  getBookingDetails: (id) => axiosClient.get(`/admin/bookings/${id}`),

  
  getReviews: (params) => axiosClient.get('/admin/reviews', { params }),
  removeReview: (id) => axiosClient.delete(`/admin/reviews/${id}`),

  
  getComplaints: (params) => axiosClient.get('/admin/complaints', { params }),
  updateComplaint: (id, payload) => axiosClient.patch(`/admin/complaints/${id}`, payload),
};
