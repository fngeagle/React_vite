import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8000', // 这里替换为实际的API基础URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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