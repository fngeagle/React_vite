import { Card, Row, Col, Statistic } from 'antd';
import {
  UserOutlined,
  BarChartOutlined,
  FileDoneOutlined,
  TeamOutlined
} from '@ant-design/icons';
import LineChart from '../components/charts/LineChart';

const Dashboard: React.FC = () => {

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
      },
      {
        name: '成交量',
        data: [1200, 1500, 1400, 1600, 1800, 2000, 2200, 2100, 2300, 2400, 2500, 2600]
      }
    ]
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户数"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="访问量"
              value={3654}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="任务数"
              value={86}
              prefix={<FileDoneOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="团队数"
              value={12}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>
      
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
    </div>
  );
};

export default Dashboard;

