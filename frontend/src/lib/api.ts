import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
});

// Interceptor to handle JWT token and detailed error logging
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config;
    const baseURL = config?.baseURL || process.env.NEXT_PUBLIC_API_URL;
    const fullURL = config ? `${baseURL}${config.url}` : 'Unknown URL';

    if (!error.response) {
      // Network Error (No response received)
      error.message = `Network Error: Could not connect to API at ${fullURL}. Please check your connection or if the backend server is running.`;
    } else {
      // Server responded with an error status
      console.error(`API Error (${error.response.status}) at ${fullURL}:`, error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
