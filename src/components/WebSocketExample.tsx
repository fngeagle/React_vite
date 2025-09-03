import React, { useState, useEffect } from 'react';
import { Button, Card, List, Typography, Spin, Alert } from 'antd';
import websocketService from '../services/websocketService';
import { getAllFutures } from '../services/futuresService';
import type { FutureItem } from '../services/futuresService';
import type { SubscriptionRequest, FutureSubscription } from '../services/websocketService';

const { Title, Text } = Typography;

const WebSocketExample: React.FC = () => {
  const [futures, setFutures] = useState<FutureItem[]>([]);
  const [selectedFutures, setSelectedFutures] = useState<FutureItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [websocketStatus, setWebsocketStatus] = useState<string>('disconnected');
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 获取所有期货数据
  useEffect(() => {
    const fetchFutures = async () => {
      try {
        setLoading(true);
        const data = await getAllFutures();
        setFutures(data);
      } catch (err) {
        setError('获取期货数据失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFutures();
  }, []);

  // 初始化WebSocket连接
  useEffect(() => {
    // 组件卸载时断开连接
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // 连接WebSocket
  const connectWebSocket = async () => {
    try {
      setLoading(true);
      await websocketService.connect();
      setWebsocketStatus('connected');
      
      // 监听消息
      websocketService.on('message', (data) => {
        setMessages(prev => [...prev, data]);
      });
      
      // 监听订阅确认
      websocketService.on('subscribe', (data) => {
        console.log('订阅确认:', data);
      });
      
      // 监听错误
      websocketService.on('error', (data) => {
        setError(data.error);
      });
    } catch (err) {
      setWebsocketStatus('error');
      setError('WebSocket连接失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 断开WebSocket连接
  const disconnectWebSocket = () => {
    websocketService.disconnect();
    setWebsocketStatus('disconnected');
    setMessages([]);
  };

  // 发送订阅请求
  const subscribeToSelectedFutures = () => {
    if (selectedFutures.length === 0) {
      setError('请至少选择一个期货品种');
      return;
    }

    if (!websocketService.isConnected()) {
      setError('WebSocket未连接，请先连接WebSocket');
      return;
    }

    // 将FutureItem转换为FutureSubscription，设置默认interval为"1m"
    const futureSubscriptions: FutureSubscription[] = selectedFutures.map(future => ({
      symbol: future.symbol,
      price_per_point: future.price_per_point,
    }));

    const request: SubscriptionRequest = {
      request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      symbols: futureSubscriptions,
      start_date_show: "2025-09-02 09:33:11",
      end_date_show: "2025-09-02 11:33:11",
      start_date_pl: "2025-09-02 09:33:11",
      end_date_pl: "2025-09-02 11:33:11"
    };

    websocketService.subscribe(request)
      .then(() => {
        console.log('订阅请求发送成功');
      })
      .catch((err) => {
        setError('订阅请求发送失败');
        console.error(err);
      });
  };

  // 切换期货选择
  const toggleFutureSelection = (future: FutureItem) => {
    setSelectedFutures(prev => {
      if (prev.some(f => f.id === future.id)) {
        return prev.filter(f => f.id !== future.id);
      } else {
        return [...prev, future];
      }
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="WebSocket连接示例">
        <div style={{ marginBottom: '20px' }}>
          <Title level={4}>WebSocket状态: {websocketStatus}</Title>
          <div>
            <Button 
              type="primary" 
              onClick={connectWebSocket} 
              disabled={websocketStatus === 'connected' || loading}
              style={{ marginRight: '10px' }}
            >
              连接WebSocket
            </Button>
            <Button 
              onClick={disconnectWebSocket} 
              disabled={websocketStatus !== 'connected' || loading}
            >
              断开WebSocket
            </Button>
          </div>
        </div>

        {error && (
          <Alert 
            message="错误" 
            description={error} 
            type="error" 
            showIcon 
            closable 
            onClose={() => setError(null)}
            style={{ marginBottom: '20px' }}
          />
        )}

        <div style={{ marginBottom: '20px' }}>
          <Title level={4}>选择期货品种进行订阅</Title>
          {loading ? (
            <Spin tip="加载中..." />
          ) : (
            <List
              dataSource={futures}
              renderItem={future => (
                <List.Item>
                  <Text>{future.symbol} - {future.price_per_point}</Text>
                  <Button 
                    type={selectedFutures.some(f => f.id === future.id) ? "primary" : "default"}
                    onClick={() => toggleFutureSelection(future)}
                  >
                    {selectedFutures.some(f => f.id === future.id) ? "已选择" : "选择"}
                  </Button>
                </List.Item>
              )}
            />
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Button 
            type="primary" 
            onClick={subscribeToSelectedFutures}
            disabled={selectedFutures.length === 0 || websocketStatus !== 'connected'}
          >
            订阅选中的期货
          </Button>
        </div>

        <div>
          <Title level={4}>WebSocket消息</Title>
          <List
            dataSource={messages}
            renderItem={(message, index) => (
              <List.Item>
                <pre>{JSON.stringify(message, null, 2)}</pre>
              </List.Item>
            )}
          />
        </div>
      </Card>
    </div>
  );
};

export default WebSocketExample;