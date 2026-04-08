import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach a mock JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    // Attempt to retrieve token
    const token = localStorage.getItem('token');
    
    // Attach authorization header if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., clear token, redirect to login)
      localStorage.removeItem('token');
      // Using window.location to force a hard redirect or use your app's router logic
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
