import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface BarChartProps {
  title?: string;
  data: {
    xAxis: string[];
    series: {
      predictionStrength: number;
      isCorrect: boolean;
    }[];
  };
  onChartReady?: (chartInstance: echarts.ECharts) => void;
}

const BarChart: React.FC<BarChartProps> = ({ title='预测图', data, onChartReady }) => {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      top: 30,
      bottom: 0,
      left: 20,  //调整表内部间距，以和折线图对其
      right: 0,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.xAxis
    },
    yAxis: {
      type: 'value',
      min: -5,
      max: 5
    },
    dataZoom: [
      {
        type:'inside',
        start: 0,
        end: 100
      }
    ],
    series: [
      {
        type: 'bar',
        barWidth: '60%',  // 调整柱子宽度
        barGap: '0%',     // 柱子之间的间距
        data: data.series.map(item => ({
          value: item.predictionStrength,
          itemStyle: {
            color: item.isCorrect ? 'green' : 'red'
          }
        }))
      }
    ]
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
          height: '150px',
        }}
        onChartReady={onChartReady}
      />
    </div>
  );
};

export default BarChart;