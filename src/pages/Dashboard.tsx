import React, { useState } from 'react';
import { Card, Row, Col, DatePicker, TimePicker, Button} from 'antd';
import LineChart from '../components/charts/PriceChart';
import BarChart from '../components/charts/BarChart';
import PLChart from '../components/charts/PLChart';
import dayjs, { Dayjs } from 'dayjs';

const Dashboard: React.FC = () => {
  // 时间区间状态
  const [priceTimeRange, setPriceTimeRange] = useState({
    startDate: dayjs().startOf('day'),
    endDate: dayjs().endOf('day'),
    startTime: dayjs().startOf('day').hour(0).minute(0),
    endTime: dayjs().startOf('day').hour(23).minute(59)
  });

  // 盈亏计算时间区间状态
  const [plTimeRange, setPlTimeRange] = useState({
    startDate: dayjs().subtract(7, 'day').startOf('day'),
    endDate: dayjs().endOf('day'),
    startTime: dayjs().startOf('day').hour(0).minute(0),
    endTime: dayjs().startOf('day').hour(23).minute(59)
  });
  
  // 处理查询按钮点击
  const handleSearch = () => {
    // 格式化时间区间
    const priceStart = priceTimeRange.startDate.hour(priceTimeRange.startTime.hour()).minute(priceTimeRange.startTime.minute());
    const priceEnd = priceTimeRange.endDate.hour(priceTimeRange.endTime.hour()).minute(priceTimeRange.endTime.minute());
    
    const plStart = plTimeRange.startDate.hour(plTimeRange.startTime.hour()).minute(plTimeRange.startTime.minute());
    const plEnd = plTimeRange.endDate.hour(plTimeRange.endTime.hour()).minute(plTimeRange.endTime.minute());
    
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ whiteSpace: 'nowrap' }}>价格区间:</span>
          <DatePicker
            value={priceTimeRange.startDate}
            onChange={(date) => setPriceTimeRange({...priceTimeRange, startDate: date})}
            style={{ width: 140 }}
          />
          <TimePicker
            value={priceTimeRange.startTime}
            onChange={(time) => setPriceTimeRange({...priceTimeRange, startTime: time})}
            format="HH:mm"
            style={{ width: 100 }}
          />
          <span style={{ whiteSpace: 'nowrap' }}>-</span>
          <DatePicker
            value={priceTimeRange.endDate}
            onChange={(date) => setPriceTimeRange({...priceTimeRange, endDate: date})}
            style={{ width: 140 }}
          />
          <TimePicker
            value={priceTimeRange.endTime}
            onChange={(time) => setPriceTimeRange({...priceTimeRange, endTime: time})}
            format="HH:mm"
            style={{ width: 100 }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ whiteSpace: 'nowrap' }}>盈亏区间:</span>
          <DatePicker
            value={plTimeRange.startDate}
            onChange={(date) => setPlTimeRange({...plTimeRange, startDate: date})}
            style={{ width: 140 }}
          />
          <TimePicker
            value={plTimeRange.startTime}
            onChange={(time) => setPlTimeRange({...plTimeRange, startTime: time})}
            format="HH:mm"
            style={{ width: 100 }}
          />
          <span style={{ whiteSpace: 'nowrap' }}>-</span>
          <DatePicker
            value={plTimeRange.endDate}
            onChange={(date) => setPlTimeRange({...plTimeRange, endDate: date})}
            style={{ width: 140 }}
          />
          <TimePicker
            value={plTimeRange.endTime}
            onChange={(time) => setPlTimeRange({...plTimeRange, endTime: time})}
            format="HH:mm"
            style={{ width: 100 }}
          />
        </div>
        
        <Button type="primary" onClick={handleSearch} style={{ flexShrink: 0 }}>查询</Button>
      </div>

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


