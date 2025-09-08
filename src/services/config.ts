/**
 * 后端请求配置文件
 * 集中管理所有与后端通信相关的配置
 */

// API基础配置
export const API_CONFIG = {
  // 后端服务器地址
  BASE_URL: 'http://localhost:8000',
  // 请求超时时间（毫秒）
  TIMEOUT: 10000,
  // 默认请求头
  HEADERS: {
    'Content-Type': 'application/json',
  },
  // 认证token存储键名
  AUTH_TOKEN_KEY: 'token',
  // 认证请求头前缀
  AUTH_HEADER_PREFIX: 'Bearer',
};

// WebSocket配置
export const WEBSOCKET_CONFIG = {
  // WebSocket服务器地址
  BASE_URL: 'ws://localhost:8000',
  // WebSocket路径前缀
  PATH_PREFIX: '/ws',
  // 最大重连次数
  MAX_RECONNECT_ATTEMPTS: 5,
  // 重连延迟基数（毫秒）
  RECONNECT_DELAY: 1000,
};

// API端点配置
export const API_ENDPOINTS = {
  // 期货相关端点
  FUTURES: {
    BASE: '/futures',
    GET_ALL: '/futures',
    GET_BY_ID: (id: string) => `/futures/${id}`,
    CREATE: '/futures',
    UPDATE: (id: string) => `/futures/${id}`,
    DELETE: (id: string) => `/futures/${id}`,
    BATCH_DELETE: '/futures/batch-delete',
    SEARCH: (keyword: string) => `/futures/search?keyword=${keyword}`,
  },
  // 可以在这里添加其他API端点
  // AUTH: {
  //   LOGIN: '/auth/login',
  //   LOGOUT: '/auth/logout',
  //   REFRESH: '/auth/refresh',
  // },
};

// 环境配置
export const ENV_CONFIG = {
  // 当前环境
  NODE_ENV: import.meta.env.MODE || 'development',
  // 是否为开发环境
  IS_DEV: import.meta.env.DEV,
  // 是否为生产环境
  IS_PROD: import.meta.env.PROD,
};

// 根据环境获取配置
export const getConfig = () => {
  // 如果有不同环境的配置，可以在这里处理
  // 例如：根据环境变量切换不同的API地址
  return {
    api: API_CONFIG,
    websocket: WEBSOCKET_CONFIG,
    endpoints: API_ENDPOINTS,
    env: ENV_CONFIG,
  };
};

// 导出默认配置
export default getConfig();