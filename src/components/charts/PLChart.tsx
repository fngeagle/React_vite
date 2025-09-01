import React from 'react';
import ReactECharts from 'echarts-for-react';

interface LineChartProps {
  title?: string;
  data: {
    xAxis: string[];
    series: {
      name: string;
      data: number[];
    }[];
  };
}

const LineChart: React.FC<LineChartProps> = ({ title = '盈亏图', data }) => {
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      // 设置图表边距
      top: 30,
      bottom: 0,
      left: 0,
      right: 0,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.xAxis
    },
    yAxis: {
      type: 'value'
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      }
    ],
    series: data.series.map((item) => ({
      name: item.name,
      type: 'line',
      data: item.data,
      smooth: true
    })),
    legend: {
      data: data.series.map((item) => item.name)
    }
  };

  return (
    <div>
      <h3 style={{fontSize: '16px', fontWeight: 'normal' }}>
        {title}
      </h3>
      <ReactECharts
        option={option}
        style={{
          width: '100%',
          height: '180px',
        }}
      />
    </div>
  );
};

export default LineChart;
