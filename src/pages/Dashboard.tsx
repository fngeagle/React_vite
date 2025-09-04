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
import globalStateService from '../services/globalStateService';

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
  
  
  // 图表数据状态 - 从全局状态获取初始数据
  const [chartData, setChartData] = useState<ChartData>(globalStateService.getChartData());
  

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

  // 组件挂载时设置数据监听器和全局状态监听器
  useEffect(() => {
    // 设置数据接收回调
    const dataReceivedHandler = (data: ChartData) => {
      console.log('接收到WebSocket数据:', data);
      
      // 清除超时
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      
      // 更新数据并取消加载状态，同时保存到全局状态
      setChartData(data);
      globalStateService.setChartData(data);
      setIsLoading(false);
    };

    // 设置全局状态变化监听器
    const globalStateHandler = (data: ChartData) => {
      setChartData(data);
    };

    dataProcessingService.onDataReceived(dataReceivedHandler);
    globalStateService.addListener(globalStateHandler);

    // 组件卸载时移除回调
    return () => {
      dataProcessingService.removeDataReceivedCallback();
      globalStateService.removeListener(globalStateHandler);
    };
  }, [timeoutId]);

  
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
