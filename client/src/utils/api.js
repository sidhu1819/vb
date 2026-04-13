import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true 
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  console.log(`[API Request] -> ${config.url} | Token Present: ${!!token}`);
  if (token) {
    if (config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      config.headers = { Authorization: `Bearer ${token}` };
    }
  }
  return config;
}, error => Promise.reject(error));

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh-token') {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {}, { withCredentials: true });
        
        if (res.data.accessToken) {
          localStorage.setItem('token', res.data.accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${res.data.accessToken}`;
          
          // CRITICAL FIX: Ensure the retried request explicitly uses the new token
          if (originalRequest.headers) {
             originalRequest.headers['Authorization'] = `Bearer ${res.data.accessToken}`;
          } else {
             originalRequest.headers = { Authorization: `Bearer ${res.data.accessToken}` };
          }
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
