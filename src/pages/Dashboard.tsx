import React, { useRef, useState, useEffect } from 'react';
import { Card, Row, Col, Spin } from 'antd';
import * as echarts from 'echarts';
import PriceChart from '../components/charts/PriceChart';
import BarChart from '../components/charts/BarChart';
import PLChart from '../components/charts/PLChart';
import TimeRangeSelector from '../components/timeRangeSelector/TimeRangeSelector';
import { Dayjs } from 'dayjs';
import dataProcessingService, { type ChartData } from '../services/dataProcessingService';
import websocketService from '../services/websocketService';

interface TimeRange {
  startDate: Dayjs;
  endDate: Dayjs;
  startTime: Dayjs;
  endTime: Dayjs;
}


const Dashboard: React.FC = () => {
  // 图表实例引用
  const chartRefs = useRef<echarts.ECharts[]>([]);
  
  // 加载状态和超时处理
  const [isLoading, setIsLoading] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  
  // 默认数据（不再使用，仅作参考）
  const defaultChartData: ChartData = {
    // 期货时间序列数据示例（包含午间休市时间）
    xAxis: [
      '2025-08-29 11:25',
      '2025-08-29 11:26',
      '2025-08-29 11:27',
      '2025-08-29 11:28',
      '2025-08-29 11:29',
      '2025-08-29 11:30',
      // 午间休市时间（11:30-13:00）无数据，但保持等间距显示
      '2025-08-29 13:00',
      '2025-08-29 13:01',
      '2025-08-29 13:02',
      '2025-08-29 13:03',
      '2025-08-29 13:04',
      '2025-08-29 13:05'
    ],
    price_series: [
      {
        name: '期货价格',
        data: [
          { open: 5200, high: 5210, low: 5195, close: 5205, volume: 1000, amt: 5205000, pctChg: 0.1, oi: 5000 },
          { open: 5210, high: 5220, low: 5205, close: 5215, volume: 1200, amt: 5215000, pctChg: 0.2, oi: 5100 },
          { open: 5205, high: 5215, low: 5190, close: 5210, volume: 800, amt: 5210000, pctChg: -0.1, oi: 5050 },
          { open: 5215, high: 5230, low: 5210, close: 5225, volume: 1500, amt: 5225000, pctChg: 0.3, oi: 5200 },
          { open: 5220, high: 5235, low: 5215, close: 5230, volume: 1100, amt: 5230000, pctChg: 0.2, oi: 5250 },
          { open: 5225, high: 5240, low: 5220, close: 5235, volume: 900, amt: 5235000, pctChg: 0.1, oi: 5300 },
          { open: 5230, high: 5245, low: 5225, close: 5240, volume: 1300, amt: 5240000, pctChg: 0.2, oi: 5350 },
          { open: 5235, high: 5250, low: 5230, close: 5245, volume: 1400, amt: 5245000, pctChg: 0.3, oi: 5400 },
          { open: 5240, high: 5255, low: 5235, close: 5250, volume: 1600, amt: 5250000, pctChg: 0.2, oi: 5450 },
          { open: 5245, high: 5260, low: 5240, close: 5255, volume: 1700, amt: 5255000, pctChg: 0.2, oi: 5500 },
          { open: 5250, high: 5265, low: 5245, close: 5260, volume: 1800, amt: 5260000, pctChg: 0.2, oi: 5550 },
          { open: 5255, high: 5270, low: 5250, close: 5265, volume: 1900, amt: 5265000, pctChg: 0.2, oi: 5600 }
        ]
      }
    ],
    // 交易点数据
    tradePoints: [
      { id: '1', type: 1 , price: 5200, count:1, timestamp: '2025-08-29 11:25', strategy_type:0},
      { id: '1', type: -1 , price: 5210, count:1, timestamp: '2025-08-29 11:26', strategy_type:0 },
      { id: '2', type: 1 , price: 5205, count:1, timestamp: '2025-08-29 11:27', strategy_type:1 },
      { id: '2', type: -1 , price: 5215, count:1, timestamp: '2025-08-29 11:28', strategy_type:1 }
    ],
    pred_series: [
      { prediction_strength: 2.5, prediction_quant_value: 3.5 },
      { prediction_strength: 3, prediction_quant_value: 0 },
      { prediction_strength: 3.8, prediction_quant_value: 4.8 },
      { prediction_strength: 1.2, prediction_quant_value: -1.2 },
      { prediction_strength: 2.5, prediction_quant_value: 0.5 },
      { prediction_strength: 3.7, prediction_quant_value: -3.7 },
      { prediction_strength: 3.8, prediction_quant_value: 3.5 },
      { prediction_strength: 0.1, prediction_quant_value: 0 },
      { prediction_strength: 3.8, prediction_quant_value: 4.8 },
      { prediction_strength: -1.1, prediction_quant_value: -1.2 },
      { prediction_strength: 1.5, prediction_quant_value: 0.5 },
      { prediction_strength: -6.7, prediction_quant_value: -3.7 }
    ],
    pl_series: [
      {
        name: '盈亏',
        data: [253, -233, 145, 44, 0, 456, 778, 132, -36, -500, -4, 369]
      }
    ]
  };
  
  // 图表数据状态 - 初始为空对象，等待WebSocket数据
  const [chartData, setChartData] = useState<ChartData>({
    xAxis: [],
    price_series: [],
    tradePoints: [],
    pred_series: [],
    pl_series: []
  });
  

  // 处理查询按钮点击
  const handleSearch = (priceRange: TimeRange, plRange: TimeRange, selectedFuture: any) => {
    // 清除之前的超时
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    // 设置加载状态
    setIsLoading(true);
    
    // 设置30秒超时
    const newTimeoutId = window.setTimeout(() => {
      setIsLoading(false);
      console.error('数据请求超时（30秒）');
    }, 30000);
    
    setTimeoutId(newTimeoutId);
    // 格式化时间区间
    const priceStart = priceRange.startDate.hour(priceRange.startTime.hour()).minute(priceRange.startTime.minute());
    const priceEnd = priceRange.endDate.hour(priceRange.endTime.hour()).minute(priceRange.endTime.minute());
    
    const plStart = plRange.startDate.hour(plRange.startTime.hour()).minute(plRange.startTime.minute());
    const plEnd = plRange.endDate.hour(plRange.endTime.hour()).minute(plRange.endTime.minute());
    
    // 输出到控制台进行测试
    console.log('价格图表时间区间:', {
      start: priceStart.format('YYYY-MM-DD HH:mm'),
      end: priceEnd.format('YYYY-MM-DD HH:mm')
    });
    
    console.log('盈亏图表时间区间:', {
      start: plStart.format('YYYY-MM-DD HH:mm'),
      end: plEnd.format('YYYY-MM-DD HH:mm')
    });
    
    console.log('选中的期货:', selectedFuture);
    
    // 通过WebSocket请求数据
    if (selectedFuture && websocketService.isConnected()) {
      dataProcessingService.requestData(
        [{ symbol: selectedFuture.symbol, price_per_point: selectedFuture.price_per_point }],
        priceStart.format('YYYY-MM-DD HH:mm'),
        priceEnd.format('YYYY-MM-DD HH:mm'),
        plStart.format('YYYY-MM-DD HH:mm'),
        plEnd.format('YYYY-MM-DD HH:mm')
      ).catch((error) => {
        console.error('数据请求失败:', error);
      });
    }
  };

  // 图表加载完成后的回调
  const onChartReady = (chartInstance: echarts.ECharts, index: number) => {
    chartRefs.current[index] = chartInstance;
    
    // 当所有图表都加载完成后，连接它们
    if (chartRefs.current.length === 3 && chartRefs.current.every(chart => chart !== undefined)) {
      echarts.connect([chartRefs.current[0], chartRefs.current[1], chartRefs.current[2]]);
    }
  };

  // 组件挂载时连接WebSocket并设置数据监听器
  useEffect(() => {
    // 连接WebSocket
    websocketService.connect()
      .then(() => {
        console.log('WebSocket连接成功');
      })
      .catch((error) => {
        console.error('WebSocket连接失败:', error);
      });

    // 设置数据接收回调
    dataProcessingService.onDataReceived((data) => {
      console.log('接收到WebSocket数据:', data);
      
      // 清除超时
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      
      // 更新数据并取消加载状态
      setChartData(data);
      setIsLoading(false);
    });

    // 组件卸载时清理
    return () => {
      dataProcessingService.removeDataReceivedCallback();
      websocketService.disconnect();
    };
  }, []);

  
  return (
    <div>
      {/* 时间区间选择器 */}
      <TimeRangeSelector onSearch={(priceRange, plRange, selectedFuture) => handleSearch(priceRange, plRange, selectedFuture)} />
      
      {/* 加载状态 */}
      {isLoading && (
        <Row>
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <p>正在加载数据...</p>
              </div>
            </Card>
          </Col>
        </Row>
      )}
      
      {/* 只在有数据且不在加载状态时才渲染图表 */}
      {!isLoading && chartData.xAxis && chartData.xAxis.length > 0 && chartData.price_series && chartData.pred_series && chartData.pl_series && (
        <>
          {/* 时间序列折线图 */}
          <Row>
            <Col span={24}>
              <Card>
                <PriceChart
                  title="期货交易数据趋势"
                  xAxis_data = {chartData.xAxis}
                  series_data = {chartData.price_series}
                  tradePoints = {chartData.tradePoints}
                  onChartReady={(chart) => onChartReady(chart, 0)}
                />
              </Card>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Card>
                <BarChart
                  title="预测图"
                  xAxis_data = {chartData.xAxis}
                  series_data = {chartData.pred_series}
                  onChartReady={(chart) => onChartReady(chart, 1)}
                />
              </Card>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Card>
                <PLChart
                  title="盈亏图"
                  xAxis_data = {chartData.xAxis}
                  series_data = {chartData.pl_series}
                  onChartReady={(chart) => onChartReady(chart, 2)}
                />
              </Card>
            </Col>
          </Row>
        </>
      )}
      
      {/* 没有数据且不在加载状态时的提示 */}
      {!isLoading && (!chartData.xAxis || chartData.xAxis.length === 0 || !chartData.price_series || !chartData.pred_series || !chartData.pl_series) && (
        <Row>
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p>请选择时间区间并点击查询按钮获取数据</p>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dashboard;
