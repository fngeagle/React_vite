import api from './api';

// 定义期货数据类型
export interface FutureItem {
  id: string;
  symbol: string;
  price_per_point: number;
}

// 获取所有期货数据
export const getAllFutures = async (): Promise<FutureItem[]> => {
  try {
    const response = await api.get('/futures');
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching futures data:', error);
    throw error;
  }
};

// 根据ID获取期货数据
export const getFutureById = async (id: string): Promise<FutureItem> => {
  try {
    const response = await api.get(`/futures/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching future with id ${id}:`, error);
    throw error;
  }
};

// 创建新的期货数据
export const createFuture = async (future: Omit<FutureItem, 'id'>): Promise<FutureItem> => {
  try {
    const response = await api.post('/futures', future);
    return response.data;
  } catch (error) {
    console.error('Error creating future:', error);
    throw error;
  }
};

// 更新期货数据
export const updateFuture = async (id: string, future: Partial<FutureItem>): Promise<FutureItem> => {
  try {
    const response = await api.put(`/futures/${id}`, future);
    return response.data;
  } catch (error) {
    console.error(`Error updating future with id ${id}:`, error);
    throw error;
  }
};

// 删除期货数据
export const deleteFuture = async (id: string): Promise<void> => {
  try {
    await api.delete(`/futures/${id}`);
  } catch (error) {
    console.error(`Error deleting future with id ${id}:`, error);
    throw error;
  }
};

// 批量删除期货数据
export const deleteFuturesBatch = async (ids: string[]): Promise<void> => {
  try {
    await api.post('/futures/batch-delete', { ids });
  } catch (error) {
    console.error('Error batch deleting futures:', error);
    throw error;
  }
};

// 搜索期货数据
export const searchFutures = async (keyword: string): Promise<FutureItem[]> => {
  try {
    const response = await api.get(`/futures/search?keyword=${keyword}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching futures with keyword ${keyword}:`, error);
    throw error;
  }
};