import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface TradePoint {
  id: string;
  type: number; // 1和-1.1为buy，-1为sell
  price: number; // 买入价格
  isClose: boolean; // 是否是平仓
  count: number;
  timestamp: string; // 时间刻度
}

interface PriceDataItem {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amt: number;
  pctChg: number;
  oi: number;
}

interface PriceChartProps {
  title?: string;
  xAxis_data: string[];
  series_data: {
    name: string;
    data: PriceDataItem[];
  }[];
  tradePoints?: TradePoint[]; // 新增的交易点数据
  onChartReady?: (chartInstance: echarts.ECharts) => void;
}

const PriceChart: React.FC<PriceChartProps> = ({ title = '折线图', xAxis_data, series_data, tradePoints = [], onChartReady }) => {
  // 保存图表实例的引用
  const chartInstanceRef = React.useRef<echarts.ECharts | null>(null);

  // 处理交易点数据，将其转换为ECharts需要的格式
  const processTradePoints = () => {
    if (!tradePoints || tradePoints.length === 0) return [];
    
    return tradePoints.map(point => {
      // 检查时间戳是否在xAxis_data中
      const xAxisIndex = xAxis_data.indexOf(point.timestamp);
      if (xAxisIndex === -1) return null; // 如果时间戳不匹配，则不显示数据点
      
      // 根据类型和是否平仓确定符号和颜色
      let symbol = 'triangle';
      let itemStyle = {};
      let symbolRotate = 0;
      
      if (point.isClose) {
        // 平仓操作：颜色与开仓相反
        if (point.type === 1 || point.type === -1.1) {
          // 平多仓：绿色上三角
          symbol = 'triangle';
          symbolRotate = 0; // 上三角不需要旋转
          itemStyle = { color: 'green' };
        } else {
          // 平空仓：红色下三角
          symbol = 'triangle';
          symbolRotate = 180; // 下三角需要旋转180度
          itemStyle = { color: 'red' };
        }
      } else {
        // 开仓操作
        if (point.type === 1 || point.type === -1.1) {
          // 买多开仓：红色上三角
          symbol = 'triangle';
          symbolRotate = 0; // 上三角不需要旋转
          itemStyle = { color: 'red' };
        } else {
          // 买空开仓：绿色下三角
          symbol = 'triangle';
          symbolRotate = 180; // 下三角需要旋转180度
          itemStyle = { color: 'green' };
        }
      }
      
      return {
        name: point.id,
        value: [point.timestamp, point.price],
        symbol,
        symbolRotate,
        symbolSize: 10,
        itemStyle,
        // 为每个数据点存储额外信息，用于tooltip显示
        type: point.type,
        isClose: point.isClose,
        count: point.count
      };
    }).filter(point => point !== null);
  };

  const processedTradePoints = processTradePoints();

  // 点击事件处理函数
  const handleChartClick = (params: any) => {
    console.log('点击事件触发:', params);
    
    if (params.seriesName === '交易点') {
      const point = processedTradePoints[params.dataIndex];
      if (point) {
        // 查找具有相同id但不同类型/操作的配对交易点
        const pairedPointIndex = processedTradePoints.findIndex((p, index) => 
          p && p.name === point.name && index !== params.dataIndex
        );
        if (pairedPointIndex !== -1) {
          // 使用保存的图表实例引用
          const chartInstance = chartInstanceRef.current;
          if (chartInstance) {
            // 跳转到配对的交易点
            chartInstance.dispatchAction({
              type: 'showTip',
              seriesIndex: params.seriesIndex,
              dataIndex: pairedPointIndex
            });
          } else {
            console.log('无法获取图表实例');
          }
        } else {
          console.log('未找到配对点');
        }
      }
    }
  };

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        // 处理默认的series tooltip
        let tooltipContent = '';
        params.forEach((param: any) => {
          if (param.seriesName !== '交易点') {
            // 显示时间在最上面，文字颜色为黑色
            tooltipContent += `
              <span style="color: black;">
                时间: ${param.name}<br/>
                开盘价: ${param.data.open}<br/>
                收盘价: ${param.data.close}<br/>
                成交量: ${param.data.volume}<br/>
                成交额: ${param.data.amt}<br/>
                涨跌幅: ${param.data.pctChg}%<br/>
                持仓量: ${param.data.oi}
              </span>
            `;

            tooltipContent += '<br/>';
          } else {
            // 处理交易点的tooltip
            const point = processedTradePoints[param.dataIndex];
            if (point) {
              // 显示时间在最上面，文字颜色为黑色
              const actionType = point.isClose ? (point.type === 1 || point.type === -1.1 ? '平多' : '平空') : (point.type === 1 || point.type === -1.1 ? '买多' : '买空');
              const actionNature = point.isClose ? '平仓' : '开仓';
              // 开仓用红色，平仓用绿色
              const actionColor = point.isClose ? 'green' : 'red';
              tooltipContent += `
                <span style="color: black;">
                  类型: ${actionType}<br/>
                  价格: ${point.value[1]}<br/>
                  <span style="color: ${actionColor};">操作: ${actionNature}</span><br/>
                  交易量：${point.count}<br/>
                </span>
              `;
            }
          }
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
    series: [
      ...series_data.map((item) => {
        // 转换数据以包含所有需要的信息
        const seriesData = item.data.map((d, index) => ({
          name: xAxis_data[index],
          value: d.close,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
          volume: d.volume,
          amt: d.amt,
          pctChg: d.pctChg,
          oi: d.oi
        }));
        
        return {
          name: item.name,
          type: 'line',
          data: seriesData,
          smooth: true,
          z: 1 // 设置较低的z值，使线条在下层
        };
      }),
      {
        name: '交易点',
        type: 'scatter',
        coordinateSystem: 'cartesian2d',
        data: processedTradePoints,
        symbol: (params: any) => {
          const point = processedTradePoints[params.dataIndex];
          return point ? point.symbol : 'triangle';
        },
        symbolRotate: (params: any) => {
          const point = processedTradePoints[params.dataIndex];
          return point ? point.symbolRotate : 0;
        },
        symbolSize: 10,
        itemStyle: (params: any) => {
          const point = processedTradePoints[params.dataIndex];
          return point ? point.itemStyle : { color: 'red' };
        },
        z: 2 // 设置较高的z值，使交易点在上层
      }
    ],
    legend: {
      data: series_data.map((item) => item.name).concat(['交易点'])
    }
  };

  // 图表准备就绪后的回调
  const onChartReadyCallback = (chart: echarts.ECharts) => {
    // 保存图表实例引用
    chartInstanceRef.current = chart;
    
    // 注册点击事件
    chart.on('click', handleChartClick);
    
    // 调用外部传入的onChartReady回调
    if (onChartReady) {
      onChartReady(chart);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: '16px', fontWeight: 'normal' }}>
        {title}
      </h3>
      <ReactECharts
        option={option}
        style={{
          width: '100%',
          height: '200px',
        }}
        onChartReady={onChartReadyCallback}
      />
    </div>
  );
};

export default PriceChart;
