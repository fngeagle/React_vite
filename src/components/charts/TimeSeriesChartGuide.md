# 时间序列折线图使用指南

## 概述
本文档说明如何修改折线图组件以支持时间轴显示，确保时间间距一致。

## 修改步骤

### 1. 修改LineChart组件

#### 1.1 更新接口定义
```typescript
interface LineChartProps {
  title?: string;
  data: {
    // 修改xAxis为时间戳数组
    xAxis: (string | number | Date)[];  // 支持多种时间格式
    series: {
      name: string;
      data: number[];
    }[];
  };
  timeAxis?: boolean;     // 添加时间轴标识
  equalSpacing?: boolean; // 添加等间距显示标识
}
```

#### 1.2 更新ECharts配置
```javascript
// 配置图表选项
const option = {
  title: {
    text: title,
    textStyle: {
      fontSize: 16,
      fontWeight: 'normal'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    // 如果使用等间距显示，则始终使用category类型
    // 否则根据timeAxis属性决定轴类型
    type: equalSpacing ? 'category' : (timeAxis ? 'time' : 'category'),
    // 如果是时间轴且不使用等间距，不需要data属性
    // 其他情况保留data属性
    ...(equalSpacing || !timeAxis ? { data: data.xAxis } : {})
  },
  yAxis: {
    type: 'value'
  },
  series: data.series.map((item) => ({
    name: item.name,
    type: 'line',
    // 如果使用等间距显示，直接使用原始数据
    // 如果是时间轴且不使用等间距，数据格式需要调整为[timestamp, value]对
    // 其他情况直接使用原始数据
    data: equalSpacing ? 
      item.data : 
      (timeAxis ? 
        data.xAxis.map((time, index) => [new Date(time).getTime(), item.data[index]]) : 
        item.data),
    smooth: true
  })),
  legend: {
    data: data.series.map((item) => item.name)
  }
};
```

### 2. 在Dashboard中使用时间数据

#### 2.1 准备时间数据
```typescript
// 时间序列数据
const timeSeriesData = {
  xAxis: [
    '2025-08-29 16:44',
    '2025-08-29 16:45',
    '2025-08-29 16:46',
    '2025-08-29 16:47',
    '2025-08-29 16:48',
    '2025-08-29 16:49',
    '2025-08-29 16:50'
  ],
  series: [
    {
      name: '用户访问量',
      data: [120, 150, 140, 160, 180, 200, 220]
    },
    {
      name: '订单量',
      data: [80, 90, 85, 95, 100, 110, 120]
    }
  ]
};
```

#### 2.2 使用组件
```tsx
<LineChart 
  title="业务数据趋势"
  data={timeSeriesData}
  timeAxis={true}
  equalSpacing={true}
/>
```

### 3. 时间格式支持

组件支持以下时间格式：
1. ISO字符串: '2025-08-29 16:44'
2. 时间戳: 1756456789000
3. Date对象: new Date()

### 4. 等间距时间轴显示

对于某些特殊场景（如期货数据），可能需要在时间轴上保持等间距显示，即使某些时间段没有数据。可以通过设置 `equalSpacing` 属性为 `true` 来实现：

```tsx
<LineChart
  title="等间距时间序列数据示例"
  data={timeSeriesData}
  timeAxis={true}
  equalSpacing={true}
/>
```

当 `equalSpacing` 设置为 `true` 时：
- 图表将使用类目轴（category axis）而非时间轴（time axis）显示
- 所有数据点之间的间距将保持一致
- 即使在没有数据的时间段（如期货交易的午间休市时间）也会保持一致的间距显示

### 5. 注意事项

1. 确保xAxis和series.data数组长度一致
2. 时间数据需要按时间顺序排列
3. ECharts会自动处理时间间隔，确保间距一致
4. 可以通过tooltip显示详细的时间信息
5. 使用equalSpacing属性时，时间轴将显示为等间距，不考虑实际时间差