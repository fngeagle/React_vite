import React, { useRef } from 'react';
import { Card, Row, Col } from 'antd';
import * as echarts from 'echarts';
import PriceChart from '../components/charts/PriceChart';
import BarChart from '../components/charts/BarChart';
import PLChart from '../components/charts/PLChart';
import TimeRangeSelector from '../components/timeRangeSelector/TimeRangeSelector';
import { Dayjs } from 'dayjs';

interface TimeRange {
  startDate: Dayjs;
  endDate: Dayjs;
  startTime: Dayjs;
  endTime: Dayjs;
}

const Dashboard: React.FC = () => {
  // 图表实例引用
  const chartRefs = useRef<echarts.ECharts[]>([]);

  // 处理查询按钮点击
  const handleSearch = (priceRange: TimeRange, plRange: TimeRange, selectedFuture: any) => {
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
  };

  // 图表加载完成后的回调
  const onChartReady = (chartInstance: echarts.ECharts, index: number) => {
    chartRefs.current[index] = chartInstance;
    
    // 当所有图表都加载完成后，连接它们
    if (chartRefs.current.length === 3 && chartRefs.current.every(chart => chart !== undefined)) {
      echarts.connect([chartRefs.current[0], chartRefs.current[1], chartRefs.current[2]]);
    }
  };

  // 期货时间序列数据示例（包含午间休市时间）
  const SeriesData = {
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
      { id: '1', type: 1 , price: 5200, isClose: false, count:1, timestamp: '2025-08-29 11:25' },
      { id: '1', type: -1 , price: 5210, isClose: true, count:1, timestamp: '2025-08-29 11:26' },
      { id: '3', type: 1 , price: 5205, isClose: true, count:1, timestamp: '2025-08-29 11:27' },
      { id: '4', type: -1 , price: 5215, isClose: true, count:1, timestamp: '2025-08-29 11:28' }
    ],
    pred_series: [
      { predictionStrength: 3.5, isCorrect: true },
      { predictionStrength: 0, isCorrect: false },
      { predictionStrength: 4.8, isCorrect: true },
      { predictionStrength: -1.2, isCorrect: false },
      { predictionStrength: 0.5, isCorrect: true },
      { predictionStrength: -3.7, isCorrect: false },
      { predictionStrength: 3.5, isCorrect: true },
      { predictionStrength: 0, isCorrect: false },
      { predictionStrength: 4.8, isCorrect: true },
      { predictionStrength: -1.2, isCorrect: false },
      { predictionStrength: 0.5, isCorrect: true },
      { predictionStrength: -3.7, isCorrect: false }
    ],
    pl_series: [
      {
        name: '盈亏',
        data: [253, -233, 145, 44, 0, 456, 778, 132, -36, -500, -4, 369]
      }
    ]
  };
  
  return (
    <div>
      {/* 时间区间选择器 */}
      <TimeRangeSelector onSearch={(priceRange, plRange, selectedFuture) => handleSearch(priceRange, plRange, selectedFuture)} />
      
      {/* 时间序列折线图 */}
      <Row>
        <Col span={24}>
          <Card>
            <PriceChart
              title="期货交易数据趋势"
              xAxis_data = {SeriesData.xAxis}
              series_data = {SeriesData.price_series}
              tradePoints = {SeriesData.tradePoints}
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
              xAxis_data = {SeriesData.xAxis}
              series_data = {SeriesData.pred_series}
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
              xAxis_data = {SeriesData.xAxis}
              series_data = {SeriesData.pl_series}
              onChartReady={(chart) => onChartReady(chart, 2)}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
