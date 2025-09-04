import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface PLChartProps {
  title?: string;
  xAxis_data: string[];
  series_data: {
    name: string;
    data: number[];
  }[];

  onChartReady?: (chartInstance: echarts.ECharts) => void;
}

const PLChart: React.FC<PLChartProps> = ({ title = '盈亏图', xAxis_data, series_data, onChartReady }) => {
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        let tooltipContent = '';
        params.forEach((param: any) => {
          // 显示时间在最上面，文字颜色为黑色
          tooltipContent += `
            <span style="color: black;">
              时间: ${param.name}<br/>
              ${param.seriesName}: ${param.value}
            </span>
            <br/>
          `;
        });
        return tooltipContent;
      }
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
      data: xAxis_data
    },
    yAxis: {
      type: 'value',
      scale: 'true'
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      }
    ],
    series: series_data.map((item) => ({
      name: item.name,
      type: 'line',
      data: item.data,
      smooth: true
    })),
    legend: {
      data: series_data.map((item) => item.name)
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
        onChartReady={onChartReady}
      />
    </div>
  );
};

export default PLChart;
