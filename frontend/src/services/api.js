import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eroturf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — AuthContext handles user state clearing
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only clear token if the server explicitly says the token is invalid/expired
    // (not for booking conflicts or other 401-adjacent errors)
    if (err.response?.status === 401) {
      const msg = err.response?.data?.message || '';
      // Clear token only for auth-specific failures, not slot/booking conflicts
      if (msg.includes('token') || msg.includes('Token') || msg.includes('Authentication')) {
        localStorage.removeItem('eroturf_token');
        localStorage.removeItem('eroturf_user');
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const verifyFirebaseToken = (data) => api.post('/auth/verify', data);
export const getMe = () => api.get('/auth/me');
export const sendOtp = (phone) => api.post('/auth/otp/send', { phone });
export const verifyOtp = (phone, code, name) => api.post('/auth/otp/verify', { phone, code, name });

// Turfs
export const getTurfs = () => api.get('/turfs');
export const getTurf = (id) => api.get(`/turfs/${id}`);
export const seedDemoTurf = () => api.post('/turfs/seed/demo');

// Slots
export const getSlots = (turfId, date) => api.get(`/slots/${turfId}/${date}`);

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/my');
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);

// Payments
export const createRazorpayOrder = (data) => api.post('/payments/create-order', data);
export const verifyRazorpayPayment = (data) => api.post('/payments/verify', data);
export const getMyPayments = () => api.get('/payments/my');

// Cricket
export const getLiveMatches = () => api.get(`/cricket/live?t=${Date.now()}`);
export const getUpcomingMatches = () => api.get(`/cricket/upcoming?t=${Date.now()}`);

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminBookings = (params) => api.get('/admin/bookings', { params });
export const getAdminUsers = () => api.get('/admin/users');
export const blockSlots = (data) => api.post('/admin/slots/block', data);
export const unblockSlots = (data) => api.post('/admin/slots/unblock', data);

// User profile
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);

export default api;
