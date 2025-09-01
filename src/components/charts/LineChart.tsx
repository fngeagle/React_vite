import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

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

const LineChart: React.FC<LineChartProps> = ({ title = '折线图', data}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      // 初始化 ECharts 实例
      const myChart = echarts.init(chartRef.current);
      
      // 配置图表选项
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
      
      // 设置图表配置
      myChart.setOption(option);
      
      // 组件卸载时销毁图表实例
      return () => {
        myChart.dispose();
      };
    }
  }, [title, data]);

  return (
    <div>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 'normal' }}>
        {title}
      </h3>
      <div
        ref={chartRef}
        style={{
          width: '100%',
          height: '300px',
        }}
      />
    </div>
  );
};

export default LineChart;
