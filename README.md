# 期货管理系统 - WebSocket连接说明

## 概述

本项目包含一个WebSocket服务，用于与后端服务器进行实时通信。该服务允许客户端订阅期货数据更新，并接收实时推送的消息。

## 文件结构

- `src/services/websocketService.ts` - WebSocket服务核心实现
- `src/components/WebSocketExample.tsx` - WebSocket使用示例组件
- `src/App.tsx` - 路由配置，包含WebSocket示例页面
- `src/components/Layout.tsx` - 导航布局，包含WebSocket示例链接

## WebSocket服务使用方法

### 1. 导入服务

```typescript
import websocketService from '../services/websocketService';
```

### 2. 连接WebSocket

```typescript
// 连接到WebSocket服务器
await websocketService.connect();
```

### 3. 发送订阅请求

```typescript
import type { SubscriptionRequest, FutureSubscription } from '../services/websocketService';

// 将期货数据转换为订阅格式
const futureSubscriptions: FutureSubscription[] = selectedFutures.map(future => ({
  symbol: future.symbol,
  interval: "1m", // 默认间隔为1分钟
  price_per_point: future.price_per_point, // 每点价格
  expiry_date: new Date().toISOString().split('T')[0] // 到期日
}));

const request: SubscriptionRequest = {
  request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // 唯一的请求ID
  timestamp: new Date().toISOString(), // ISO 8601 格式的时间戳
  symbols: futureSubscriptions, // 选择的期货品种和间隔
  start_date_show: new Date().toISOString(), // ISO 8601 格式的开始日期
  end_date_show: new Date().toISOString(), // ISO 8601 格式的结束日期
  start_date_pl: new Date().toISOString(), // ISO 8601 格式的盈亏开始日期
  end_date_pl: new Date().toISOString() // ISO 8601 格式的盈亏结束日期
};

// 发送订阅请求
await websocketService.subscribe(request);
```

### 4. 监听消息

```typescript
// 监听通用消息
websocketService.on('message', (data) => {
  console.log('收到消息:', data);
});

// 监听订阅确认
websocketService.on('subscribe', (data) => {
  console.log('订阅确认:', data);
});

// 监听错误消息
websocketService.on('error', (data) => {
  console.error('错误:', data);
});
```

### 5. 发送消息

```typescript
// 发送自定义消息
websocketService.send({ type: 'custom', data: 'some data' });
```

### 6. 断开连接

```typescript
// 断开WebSocket连接
websocketService.disconnect();
```

## WebSocket示例页面

项目中包含一个WebSocket使用示例页面，可以通过以下步骤访问：

1. 启动项目：`npm run dev`
2. 在浏览器中打开：`http://localhost:5173/WebSocketExample`
3. 点击"连接WebSocket"按钮建立连接
4. 选择期货品种并点击"订阅选中的期货"按钮发送订阅请求
5. 查看接收到的WebSocket消息

## API端点

WebSocket服务器端点：`ws://localhost:8000/ws/{client_id}`

其中`{client_id}`是客户端唯一标识符，由WebSocket服务自动生成。

## 消息格式

### 客户端发送的订阅请求

```json
{
  "request_id": "req_1632567890123_abc123",
  "timestamp": "2025-09-02T06:30:00.000Z",
  "symbols": [
    {
      "symbol": "RB2501",
      "interval": "1m",
      "price_per_point": 10,
      "expiry_date": "2025-09-01"
    },
    {
      "symbol": "HC2501",
      "interval": "1m",
      "price_per_point": 5,
      "expiry_date": "2025-09-01"
    }
  ],
  "start_date_show": "2025-09-01T00:00:00.000Z",
  "end_date_show": "2025-09-02T00:00:00.000Z",
  "start_date_pl": "2025-09-01T00:00:00.000Z",
  "end_date_pl": "2025-09-02T00:00:00.000Z"
}
```

### 服务器响应消息

成功订阅响应：
```json
{
  "status": "success",
  "message": "订阅已成功更新，共 1 个品种。",
  "subscribed_symbols": ["RB2501"]
}
```

错误响应：
```json
{
  "error": "无效的消息格式",
  "details": []
}
```

## 注意事项

1. 确保后端WebSocket服务器正在运行
2. 检查防火墙设置，确保WebSocket端口（默认8000）未被阻止
3. 在生产环境中，需要修改WebSocket服务器地址
4. WebSocket服务具有自动重连功能，最多尝试5次重连
