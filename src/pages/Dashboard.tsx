import React from 'react';
import { Card, Row, Col } from 'antd';
import LineChart from '../components/charts/PriceChart';
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

  // 期货时间序列数据示例（包含午间休市时间）
  const timeSeriesData = {
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
    series: [
      {
        name: '期货价格',
        data: [5200, 5210, 5205, 5215, 5220, 5225, 5230, 5235, 5240, 5245, 5250, 5255]
      }
    ]
  };

  // 预测强度数据示例
  const predictionData = {
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
    series: [
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
    ]
  };

  // 盈亏模拟数据
  const PLSeriesData = {
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
    series: [
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
            <LineChart
              title="期货交易数据趋势"
              data={timeSeriesData}
            />
          </Card>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Card>
            <BarChart
              title="预测图"
              data={predictionData}
            />
          </Card>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Card>
            <PLChart
              title="盈亏图"
              data={PLSeriesData}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
