import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : '/api'
);

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized/Expired token detected. Logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Use window.location to force redirect if needed, 
      // or rely on the app state to handle the missing user.
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api