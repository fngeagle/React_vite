import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

interface TradePoint {
  id: string;
  type: number; // 1为buy，-1为sell
  price: number; // 买入价格
  count: number;
  timestamp: string; // 时间刻度
  strategy_type: number; // 0为结束单，-1为锁仓，1为开仓
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
  predicted_price: number;
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
    
    // 过滤掉count为0的交易点
    const filteredTradePoints = tradePoints.filter(point => point.count !== 0);
    
    // 检查开仓锁仓对
    const hasPairedStrategy = (id: string) => {
      const point = filteredTradePoints.find(p => p.id === id);
      if (!point) return false;
      
      // 查找相同id的其他策略类型点
      const sameIdPoints = filteredTradePoints.filter(p => p.id === id);
      const hasOpen = sameIdPoints.some(p => p.strategy_type === 1); // 开仓
      const hasLock = sameIdPoints.some(p => p.strategy_type === -1); // 锁仓
      
      return hasOpen && hasLock;
    };
    
    return filteredTradePoints.map(point => {
      // 检查时间戳是否在xAxis_data中
      const xAxisIndex = xAxis_data.indexOf(point.timestamp);
      if (xAxisIndex === -1) return null; // 如果时间戳不匹配，则不显示数据点
      
      // 根据类型和策略类型确定符号和颜色
      let symbol = 'triangle';
      let borderColor = '';
      let fillColor = '';
      let symbolRotate = 0;
      
      // 第三个判断条件：如果strategy_type为0，则显示形状是正方形
      if (point.strategy_type === 0) {
        symbol = 'rect';
        // 正方形的颜色根据类型确定
        borderColor = point.type === 1 ? 'red' : 'green';
        fillColor = point.type === 1 ? 'red' : 'green';
      } else {
        // 第一个判断条件：类型（多/空）
        if (point.type === 1) {
          // 多：上三角形红色边框
          symbol = 'triangle';
          symbolRotate = 0; // 上三角不需要旋转
          borderColor = 'red';
        } else if (point.type === -1) {
          // 空：下三角形绿色边框
          symbol = 'triangle';
          symbolRotate = 180; // 下三角需要旋转180度
          borderColor = 'green';
        }
        
        // 第二个判断条件：决策（开仓/锁仓）
        // 如果开仓锁仓存在一对，则中间是白色，否则根据类型确定颜色
        if (hasPairedStrategy(point.id)) {
          fillColor = 'white';
        } else {
          fillColor = point.type === 1 ? 'red' : 'green';
        }
      }
      
      return {
        name: point.id,
        value: [point.timestamp, point.price],
        symbol,
        symbolRotate,
        symbolSize: 10,
        itemStyle: {
          color: fillColor,
          borderColor: borderColor,
          borderWidth: 2
        },
        // 为每个数据点存储额外信息，用于tooltip显示
        type: point.type,
        count: point.count,
        strategy_type: point.strategy_type
      };
    }).filter(point => point !== null);
  };

  const processedTradePoints = processTradePoints();

  // 点击事件处理函数
  const handleChartClick = (params: any) => {
    console.log('点击事件触发:', params);
    
    if (params.seriesName === '交易点') {
      const point = processedTradePoints[params.dataIndex];
      console.log('点击事件触发:', point);
      if (point) {
        // 查找具有相同id的配对交易点
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
        let hasMainData = false;
        let hasPredictionData = false;
        let mainData: any = null;
        let predictionData: any = null;
        
        // 首先遍历所有参数，收集数据
        params.forEach((param: any) => {
          if (param.seriesName !== '交易点' && param.seriesName !== '预测价格') {
            // 主要价格数据（期货价格）
            if (!hasMainData) {
              hasMainData = true;
              mainData = param;
            }
          } else if (param.seriesName === '预测价格') {
            // 预测价格数据
            if (!hasPredictionData && param.data && param.data.predicted_price !== undefined && param.data.predicted_price !== null && param.data.predicted_price !== 0) {
              hasPredictionData = true;
              predictionData = param;
            }
          }
        });
        
        // 显示主要数据
        if (hasMainData && mainData) {
          tooltipContent += `
            <span style="color: black;">
              时间: ${mainData.name}<br/>
              开盘价: ${mainData.data.open}<br/>
              收盘价: ${mainData.data.close}<br/>
              成交量: ${mainData.data.volume}
          `;
              // 成交额: ${mainData.data.amt}<br/>
              // 涨跌幅: ${mainData.data.pctChg}%<br/>
              // 持仓量: ${mainData.data.oi}
          
          // 如果有预测价格数据，添加预测价格信息
          if (hasPredictionData && predictionData && predictionData.data && predictionData.data.predicted_price !== undefined && predictionData.data.predicted_price !== null) {
            tooltipContent += `<br/>预测价格: ${predictionData.data.predicted_price}`;
          }
          
          tooltipContent += `</span><br/>`;
        }
        
        // 处理交易点数据
        params.forEach((param: any) => {
          if (param.seriesName === '交易点') {
            // 处理交易点的tooltip
            const point = processedTradePoints[param.dataIndex];
            if (point) {
              // 显示时间在最上面，文字颜色为黑色
              // 根据strategy_type确定操作类型
              let actionType = '';
              let strategy_type = '';
              if (point.strategy_type === 0) {
                strategy_type = '结束单';
              } else if (point.strategy_type === -1) {
                strategy_type = '锁仓';
              } else if (point.strategy_type === 1) {
                strategy_type = '开仓';
              }
              actionType = point.type === 1 ? '买多' : '买空';
              
              // 根据type确定颜色
              const actionColor = point.type === 1 ? 'red' : 'green';
              tooltipContent += `
                <span style="color: black;">
                  决策: ${strategy_type}<br/>
                  价格: ${point.value[1]}<br/>
                  <span style="color: ${actionColor};">类型: ${point.type === 1 ? '多' : '空'}</span><br/>
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
          oi: d.oi,
          predicted_price: d.predicted_price
        }));
        
        return {
          name: item.name,
          type: 'line',
          data: seriesData,
          smooth: true,
          showSymbol: false,
          z: 1 // 设置较低的z值，使线条在下层
        };
      }),
      // 添加预测价格线
      {
        name: '预测价格',
        type: 'line',
        data: series_data[0].data.map((d, index) => ({
          name: xAxis_data[index],
          value: d.predicted_price === 0 ? null : d.predicted_price, // 将0值转换为null
          predicted_price: d.predicted_price
        })),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: '#FF6B6B',
          width: 2,
          type: 'dashed'
        },
        connectNulls: true, // 连接null值，实现跨越0值点的效果
        z: 1.5 // 设置z值在价格线和交易点之间
      },
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
      data: series_data.map((item) => item.name).concat(['预测价格', '交易点'])
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
