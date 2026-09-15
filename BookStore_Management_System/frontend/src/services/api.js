import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/dashboard/stats');

// ── Books ─────────────────────────────────────────────────────────────────────
export const getBooks = (search = '') => api.get('/books', { params: search ? { search } : {} });
export const getBook = (id) => api.get(`/books/${id}`);
export const createBook = (data) => api.post('/books', data);
export const updateBook = (id, data) => api.put(`/books/${id}`, data);
export const deleteBook = (id) => api.delete(`/books/${id}`);

// ── Issues ────────────────────────────────────────────────────────────────────
export const getIssues = (status = 'all') => api.get('/issues', { params: status !== 'all' ? { status } : {} });
export const getIssue = (id) => api.get(`/issues/${id}`);
export const issueBook = (data) => api.post('/issues', data);
export const calculateCharge = (id, returnDate) => api.post(`/issues/${id}/calculate`, { returnDate });
export const returnBook = (id, returnDate) => api.post(`/issues/${id}/return`, { returnDate });

export default api;
