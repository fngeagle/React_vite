import axios from 'axios';
import { API_CONFIG } from './config';

// 创建axios实例
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    const token = localStorage.getItem(API_CONFIG.AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `${API_CONFIG.AUTH_HEADER_PREFIX} ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 可以在这里统一处理错误
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;