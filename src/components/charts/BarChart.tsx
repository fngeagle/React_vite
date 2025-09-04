import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface BarChartProps {
  title?: string;
  xAxis_data: string[];
  series_data: {
    prediction_strength: number;
    prediction_quant_value: number;
  }[];
  onChartReady?: (chartInstance: echarts.ECharts) => void;
}

const BarChart: React.FC<BarChartProps> = ({ title='预测图', xAxis_data, series_data, onChartReady }) => {
  // 根据prediction_quant_value计算颜色
  const getColor = (value: number) => {
    // 限制范围在-5到5之间
    const clampedValue = Math.min(Math.max(value, -5), 5);
    
    // 计算颜色比例
    if (clampedValue > 0) {
      // 正值：从白色到绿色
      const ratio = clampedValue / 5;
      const red = Math.floor(255 * (1 - ratio));
      const green = 255;
      const blue = Math.floor(255 * (1 - ratio));
      return `rgb(${red}, ${green}, ${blue})`;
    } else if (clampedValue < 0) {
      // 负值：从红色到白色
      const ratio = Math.abs(clampedValue) / 5;
      const red = 255;
      const green = Math.floor(255 * (1 - ratio));
      const blue = Math.floor(255 * (1 - ratio));
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      // 0值：白色
      return 'white';
    }
  };

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        let tooltipContent = '';
        params.forEach((param: any) => {
          // 添加检查确保param存在且有必要的属性
          if (!param) return;
          
          // 显示时间在最上面，文字颜色为黑色
          const item = series_data[param.dataIndex];
          // 添加检查确保item存在
          if (!item) return;
          
          // 当预测强度为0时不显示预测结果
          if (param.value === 0) {
            tooltipContent += `
              <span style="color: black;">
                时间: ${param.name || 'N/A'}<br/>
                无预测
              </span>
            `;
          } else {
            tooltipContent += `
              <span style="color: black;">
                时间: ${param.name || 'N/A'}<br/>
                预测强度: ${param.value}<br/>
                预测值: ${item.prediction_quant_value}
              </span>
            `;
          }
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
          value: item.prediction_strength,
          itemStyle: {
            color: getColor(item.prediction_quant_value),
            borderColor: '#00000017',
            borderWidth: 1,
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