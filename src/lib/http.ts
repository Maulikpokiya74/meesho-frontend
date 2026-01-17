import axios from 'axios';
import { toast } from './toast';

// Centralized Axios instance that automatically attaches the auth token
const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Assign Authorization header safely for Axios v1 types
    const headers: Record<string, string> = {};
    headers['Authorization'] = `Bearer ${token}`;
    // Merge existing headers if present
    config.headers = { ...(config.headers as any), ...headers } as any;
  }
  return config;
});

export default http;

// Global response handlers to show API messages
http.interceptors.response.use(
  (res) => {
    const msg = (res.data && (res.data.message || res.data.msg)) || undefined;
    if (msg) toast(msg, 'success');
    return res;
  },
  (err) => {
    const msg = err?.response?.data?.message || err?.response?.data?.msg || err?.message || 'Request failed';
    toast(msg, 'error');
    return Promise.reject(err);
  }
);
