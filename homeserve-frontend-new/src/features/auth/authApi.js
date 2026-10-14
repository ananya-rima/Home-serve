import axiosClient from '../../api/axiosClient';

export const authApi = {
  register: (payload) => axiosClient.post('/auth/register', payload),
  login: (payload) => axiosClient.post('/auth/login', payload),
  verifyOtp: (payload) => axiosClient.post('/auth/verify-otp', payload),
  resendOtp: (payload) => axiosClient.post('/auth/resend-otp', payload),
  logout: (refreshToken) => axiosClient.post('/auth/logout', { refreshToken }),
  getMe: () => axiosClient.get('/auth/me'),
};
