import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface BarChartProps {
  title?: string;
  xAxis_data: string[];
  series_data: {
    predictionStrength: number;
    isCorrect: boolean;
  }[];
  onChartReady?: (chartInstance: echarts.ECharts) => void;
}

const BarChart: React.FC<BarChartProps> = ({ title='预测图', xAxis_data, series_data, onChartReady }) => {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        let tooltipContent = '';
        params.forEach((param: any) => {
          // 显示时间在最上面，文字颜色为黑色
          const item = series_data[param.dataIndex];
          const correctness = item.isCorrect ? '正确' : '错误';
          
          tooltipContent += `
            <span style="color: black;">
              时间: ${param.name}<br/>
              预测强度: ${param.value}<br/>
              预测结果: ${correctness}
            </span>
          `;
        });
        return tooltipContent;
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
      data: xAxis_data
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
        data: series_data.map(item => ({
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