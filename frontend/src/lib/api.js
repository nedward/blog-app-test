import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = (typeof window !== 'undefined' && window.NEXT_PUBLIC_API_URL) || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const tokenManager = {
  getAccessToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },
  
  getRefreshToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },
  
  setTokens: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  },
  
  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken } = response.data;
          tokenManager.setTokens(accessToken, refreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Show error toast for non-auth errors
    if (error.response?.data?.error?.message) {
      toast.error(error.response.data.error.message);
    } else if (error.message) {
      toast.error(error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

// Posts API
export const postsAPI = {
  create: (data) => api.post('/posts', data),
  getAll: (params) => api.get('/posts', { params }),
  getById: (id) => api.get(`/posts/${id}`),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  getUserPosts: (userId, params) => api.get(`/posts/user/${userId}`, { params }),
};

// Engagement API
export const engagementAPI = {
  toggle: (postId, isLike) => api.post(`/engagements/posts/${postId}`, { isLike }),
  getStats: (postId) => api.get(`/engagements/posts/${postId}`),
  getUserEngagements: (params) => api.get('/engagements/user', { params }),
  getTrending: (params) => api.get('/engagements/trending', { params }),
};

// Sentiment API
export const sentimentAPI = {
  getDistribution: () => api.get('/sentiment/distribution'),
  getTrendingEmotions: (params) => api.get('/sentiment/trending-emotions', { params }),
  getPostSentiment: (postId) => api.get(`/sentiment/post/${postId}`),
};

export { tokenManager };
export default api;