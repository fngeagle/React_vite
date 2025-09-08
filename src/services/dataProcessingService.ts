import websocketService from './websocketService';
import type { SubscriptionRequest, FutureSubscription } from './websocketService';

// 定义图表数据结构
export interface ChartData {
  xAxis: string[];
  price_series: {
    name: string;
    data: {
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      amt: number;
      pctChg: number;
      oi: number;
      predicted_price: number;
    }[];
  }[];
  tradePoints: {
    id: string;
    type: number;
    price: number;
    count: number;
    timestamp: string;
    strategy_type:number;
  }[];
  pred_series: {
    prediction_strength: number;
    prediction_quant_value: number;
  }[];
  pl_series: {
    name: string;
    data: number[];
  }[];
}

class DataProcessingService {
  private onDataReceivedCallback: ((data: ChartData) => void) | null = null;

  constructor() {
    // 监听WebSocket消息
    websocketService.on('message', (data) => {
      this.handleWebSocketData(data);
    });
  }

  // 处理WebSocket接收到的数据
  private handleWebSocketData(data: any) {
    // 如果status为success
    if (data.status === 'init') {
      // 如果有数据接收回调函数，则处理数据并传递给回调函数
      if (this.onDataReceivedCallback) {
        const processedData = this.processWebSocketData(data.data);
        this.onDataReceivedCallback(processedData);
      }
    }
  }

  // 处理WebSocket数据，将后端返回的数据转换为图表所需格式
  // 后端字段映射关系：
  // Timestamp -> xAxis (时间戳转换为日期字符串)
  // Open -> price_series.data.open
  // High -> price_series.data.high
  // Low -> price_series.data.low
  // Close -> price_series.data.close
  // Volume -> price_series.data.volume
  // Amt -> price_series.data.amt
  // PctChg -> price_series.data.pctChg
  // Oi -> price_series.data.oi
  // PnL -> pl_series.data
  // prediction_strength -> pred_series.prediction_strength
  // prediction_quant_value -> pred_series.prediction_quant_value
  // deal_type -> tradePoints.type (Close=-1, Sell=1)
  // deal_count -> tradePoints.count
  // Price -> tradePoints.price
  // id -> tradePoints.id
  // is_close -> tradePoints.isClose
  private processWebSocketData(webSocketData: any): ChartData {
    console.log(webSocketData)

    // 如果webSocketData是JSON格式的字符串，需要先解析
    let parsedData: any;
    if (typeof webSocketData === 'string') {
      try {
        parsedData = JSON.parse(webSocketData);
      } catch (error) {
        console.error('Failed to parse WebSocket data as JSON:', webSocketData);
        throw new Error('Invalid JSON format in WebSocket data');
      }
    } else {
      parsedData = webSocketData;
    }

    // 确保parsedData是数组格式
    let data: any[] = [];
    if (Array.isArray(parsedData)) {
      data = parsedData;
    } else if (parsedData && typeof parsedData === 'object' && Array.isArray(parsedData.data)) {
      // 如果数据在data字段中
      data = parsedData.data;
    } else {
      // 如果不是数组或不包含数据数组，返回空的ChartData
      return {
        xAxis: [],
        price_series: [],
        tradePoints: [],
        pred_series: [],
        pl_series: []
      };
    }

    // 如果数据为空，返回空的ChartData
    if (data.length === 0) {
      return {
        xAxis: [],
        price_series: [],
        tradePoints: [],
        pred_series: [],
        pl_series: []
      };
    }

    // 处理价格序列数据
    const priceData = data.map(item => ({
      open: item.Open || 0,
      high: item.High || 0,
      low: item.Low || 0,
      close: item.Close || 0,
      volume: item.Volume || 0,
      amt: item.Amt || 0,
      pctChg: item.PctChg || 0,
      oi: item.Oi || 0,
      predicted_price: item.predicted_price || 0
    }));

    // 处理x轴数据（时间戳转换为日期字符串）
    const xAxis = data.map(item => {
      if (item.Timestamp) {
        // 将时间戳转换为日期字符串
        return item.Timestamp;
      }
      return '';
    });

    // 处理交易点数据
    const rawTradePoints = data
      .filter(item => item.deal_type !== undefined && item.deal_type !== 0)
      .map(item => {
        let type = 0;
        if (item.deal_type === 'BUY') {
          type = 1;
        } else if (item.deal_type === 'SELL') {
          type = -1;
        } else if (typeof item.deal_type === 'number') {
          type = item.deal_type;
        }

        return {
          id: item.id || '',
          type: type,
          price: item.Price || 0,
          count: item.deal_count || 0,
          timestamp: item.Timestamp,
          strategy_type:item.strategy_type
        };
      });

    // 合并相同时间点的交易点
    const tradePointsMap = new Map<string, any>();
    rawTradePoints.forEach(point => {
      const key = `${point.timestamp}-${point.type}-${point.strategy_type}`;
      if (tradePointsMap.has(key)) {
        // 如果已存在相同时间点、类型和策略类型的交易点，则累加交易量
        const existingPoint = tradePointsMap.get(key);
        existingPoint.count += point.count;
        // 价格取平均值
        existingPoint.price = (existingPoint.price + point.price) / 2;
      } else {
        // 否则直接添加
        tradePointsMap.set(key, { ...point });
      }
    });
    
    // 将Map转换为数组
    const tradePoints = Array.from(tradePointsMap.values());

    // 处理预测数据
    const pred_series = data.map((item, index) => {
      // 获取预测强度
      const prediction_strength = item.prediction_strength !== null && item.prediction_strength !== undefined ? item.prediction_strength : 0;
      
      // 计算prediction_quant_value
      let prediction_quant_value = 0;
      if (prediction_strength !== 0) { // 只有当预测强度不为0时才计算
        // 查找下一个有预测强度的点
        let nextPredictionIndex = -1;
        for (let i = index + 1; i < data.length; i++) {
          const nextItemStrength = data[i].prediction_strength !== null && data[i].prediction_strength !== undefined ? data[i].prediction_strength : 0;
          if (nextItemStrength !== 0) {
            nextPredictionIndex = i;
            break;
          }
        }
        
        // 计算prediction_quant_value
        if (nextPredictionIndex !== -1) {
          // 如果后续还有预测点，则使用下一个预测点的close - 当前预测点的close
          prediction_quant_value = (data[nextPredictionIndex].Close || 0) - (item.Close || 0);
        } else {
          // 如果后续没有预测点了，则使用最新close - 当前预测点的close
          prediction_quant_value = (priceData[priceData.length - 1]?.close || 0) - (item.Close || 0);
        }
        
        // 对prediction_quant_value进行四舍五入，只保留一位小数
        prediction_quant_value = Math.round(prediction_quant_value * 10) / 10;
      }
      
      return {
        prediction_strength,
        prediction_quant_value
      };
    });

    // 处理盈亏数据
    const plData = data.map(item => item.PnL || 0);

    const chartData: ChartData = {
      xAxis: xAxis,
      price_series: [
        {
          name: '期货价格',
          data: priceData
        }
      ],
      tradePoints: tradePoints,
      pred_series: pred_series,
      pl_series: [
        {
          name: '盈亏',
          data: plData
        }
      ]
    };

    return chartData;
  }

  // 请求数据（通过WebSocket发送订阅请求）
  requestData(symbols: FutureSubscription[], startDateShow: string, endDateShow: string, startDatePl: string, endDatePl: string) {
    if (!websocketService.isConnected()) {
      console.error('WebSocket未连接');
      return Promise.reject(new Error('WebSocket未连接'));
    }

    const request: SubscriptionRequest = {
      request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      symbols: symbols,
      start_date_show: startDateShow,
      end_date_show: endDateShow,
      start_date_pl: startDatePl,
      end_date_pl: endDatePl
    };

    return websocketService.subscribe(request);
  }

  // 设置数据接收回调函数
  onDataReceived(callback: (data: ChartData) => void) {
    this.onDataReceivedCallback = callback;
  }

  // 移除数据接收回调函数
  removeDataReceivedCallback() {
    this.onDataReceivedCallback = null;
  }
}

// 创建并导出数据处理服务实例
const dataProcessingService = new DataProcessingService();
export default dataProcessingService;