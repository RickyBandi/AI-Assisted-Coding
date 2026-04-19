import axios from 'axios';

// Dev:  VITE_API_URL is not set → baseURL = '/api' → Vite proxy forwards to localhost:3000
// Prod: VITE_API_URL = 'https://jobspace-deployment.onrender.com' → direct call to Render
const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')   // strip trailing slash if any
  : '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,            // still needed for session fallback in dev
  headers: { 'Content-Type': 'application/json' }
});

// ── Attach JWT token to every request (required for cross-domain production) ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// ── If server returns 401, clear stale token so user gets redirected to login ──
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

/** Full URL to a file served from /uploads */
export const getUploadURL = (filePath) => `${API_BASE}/uploads/${filePath}`;

/** Base URL prefix for sendBeacon / direct API calls */
export const getAPIBase = () => `${API_BASE}/api`;

export const authAPI = {
  login:    (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout:   ()     => api.post('/auth/logout'),
  me:       ()     => api.get('/auth/me'),
};
export const dashboardAPI    = { get: () => api.get('/dashboard') };
export const applicationsAPI = {
  getAll: ()          => api.get('/applications'),
  create: (data)      => api.post('/applications', data),
  patch:  (id, data)  => api.patch(`/applications/${id}`, data),
  delete: (id)        => api.delete(`/applications/${id}`),
};
export const companiesAPI = {
  getAll: ()          => api.get('/companies'),
  create: (data)      => api.post('/companies', data),
  patch:  (id, data)  => api.patch(`/companies/${id}`, data),
  delete: (id)        => api.delete(`/companies/${id}`),
};
export const columnsAPI = {
  get:          (page)                 => api.get(`/columns/${page}`),
  put:          (page, columns)        => api.put(`/columns/${page}`, { columns }),
  patchOptions: (page, colId, options) => api.patch(`/columns/${page}/${colId}/options`, { options }),
};
export const documentsAPI = {
  getAll: ()   => api.get('/documents'),
  upload: (fd) => api.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/documents/${id}`),
};
export const profileAPI = {
  get:            ()     => api.get('/profile'),
  update:         (fd)   => api.put('/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => api.put('/profile/password', data),
};
export const analyticsAPI = { get: () => api.get('/analytics') };
export const adminAPI = {
  getDashboard: ()          => api.get('/admin'),
  getUsers:     ()          => api.get('/admin/users'),
  updateRole:   (id, role)  => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser:   (id)        => api.delete(`/admin/users/${id}`),
};

export default api;
