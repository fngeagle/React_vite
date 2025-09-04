import type { ChartData } from './dataProcessingService';

// 全局状态管理
class GlobalStateService {
  private chartData: ChartData = {
    xAxis: [],
    price_series: [],
    tradePoints: [],
    pred_series: [],
    pl_series: []
  };

  private listeners: Set<(data: ChartData) => void> = new Set();

  // 设置图表数据
  setChartData(data: ChartData): void {
    this.chartData = data;
    this.notifyListeners();
  }

  // 获取图表数据
  getChartData(): ChartData {
    return this.chartData;
  }

  // 添加监听器
  addListener(listener: (data: ChartData) => void): void {
    this.listeners.add(listener);
    // 立即通知新监听器当前状态
    listener(this.chartData);
  }

  // 移除监听器
  removeListener(listener: (data: ChartData) => void): void {
    this.listeners.delete(listener);
  }

  // 通知所有监听器
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.chartData));
  }

  // 清空数据
  clearChartData(): void {
    this.chartData = {
      xAxis: [],
      price_series: [],
      tradePoints: [],
      pred_series: [],
      pl_series: []
    };
    this.notifyListeners();
  }
}

// 创建并导出全局状态服务实例
const globalStateService = new GlobalStateService();
export default globalStateService;