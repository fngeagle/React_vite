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
  const handleSearch = (priceRange: TimeRange, plRange: TimeRange) => {
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
        data: [5200, 5210, 5205, 5215, 5220, 5225, 5230, 5235, 5240, 5245, 5250, 5255]
      }
    ],
    // 交易点数据
    tradePoints: [
      { id: '1', type: 'buy' as const, price: 5200, isClose: false, timestamp: '2025-08-29 11:25' },
      { id: '1', type: 'sell' as const, price: 5210, isClose: false, timestamp: '2025-08-29 11:26' },
      { id: '3', type: 'buy' as const, price: 5205, isClose: true, timestamp: '2025-08-29 11:27' },
      { id: '4', type: 'sell' as const, price: 5215, isClose: true, timestamp: '2025-08-29 11:28' }
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
      <TimeRangeSelector onSearch={handleSearch} />
      
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
