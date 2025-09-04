import type { FutureItem } from './futuresService';

// 定义期货订阅项
export interface FutureSubscription {
  symbol: string;
  price_per_point: number;
}

// 定义订阅请求的数据结构
export interface SubscriptionRequest {
  request_id: string;
  timestamp: string;
  symbols: FutureSubscription[];
  start_date_show: string | null;
  end_date_show: string | null;
  start_date_pl: string | null;
  end_date_pl: string | null;
}

// 定义WebSocket消息类型
export interface WebSocketMessage {
  status?: string;
  message?: string;
  subscribed_symbols?: string[];
  error?: string;
  details?: any;
  data?: any;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private clientId: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private url: string;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private isConnectedFlag: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    // 生成客户端ID
    this.clientId = this.generateClientId();
    // WebSocket服务器地址
    this.url = `ws://localhost:8000/ws/${this.clientId}`;
  }

  // 生成客户端ID
  private generateClientId(): string {
    return 'client_' + Math.random().toString(36).substr(2, 9);
  }

  // 连接到WebSocket服务器
  connect(): Promise<void> {
    // 如果已经有正在进行的连接尝试，返回相同的promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      // 如果已经连接，则直接返回
      if (this.isConnectedFlag && this.socket?.readyState === WebSocket.OPEN) {
        this.connectionPromise = null;
        resolve();
        return;
      }

      try {
        // 创建WebSocket连接
        this.socket = new WebSocket(this.url);

        // 监听连接成功事件
        this.socket.onopen = () => {
          console.log('WebSocket连接成功，客户端ID:', this.clientId);
          this.reconnectAttempts = 0;
          this.isConnectedFlag = true;
          this.connectionPromise = null;
          resolve();
        };

        // 监听消息事件
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('解析WebSocket消息失败:', error);
          }
        };

        // 监听连接错误事件
        this.socket.onerror = (error: any) => {
          console.error('WebSocket连接错误:', error);
          this.isConnectedFlag = false;
          this.connectionPromise = null;
          reject(error);
        };

        // 监听连接关闭事件
        this.socket.onclose = (event) => {
          console.log('WebSocket连接关闭:', event.reason);
          this.isConnectedFlag = false;
          
          // 如果不是主动关闭，尝试重连
          if (!event.wasClean) {
            this.handleReconnect();
          }
        };
      } catch (error) {
        console.error('创建WebSocket连接失败:', error);
        reject(error);
      }
    });
    
    return this.connectionPromise;
  }

  // 处理接收到的消息
  private handleMessage(data: any) {
    // 如果有通用消息处理器，调用它
    const messageHandlers = this.messageHandlers.get('message');
    if (messageHandlers) {
      messageHandlers.forEach(handler => handler(data));
    }

    // 如果是订阅确认消息，触发特定事件
    if (data.status === 'success' && data.subscribed_symbols) {
      const subscribeHandlers = this.messageHandlers.get('subscribe');
      if (subscribeHandlers) {
        subscribeHandlers.forEach(handler => handler(data));
      }
    }

    // 如果是错误消息，触发错误事件
    if (data.error) {
      const errorHandlers = this.messageHandlers.get('error');
      if (errorHandlers) {
        errorHandlers.forEach(handler => handler(data));
      }
    }
  }

  // 处理重连逻辑
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('重连失败:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('达到最大重连次数，停止重连');
    }
  }

  // 发送订阅请求
  subscribe(request: SubscriptionRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnectedFlag || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket未连接'));
        return;
      }

      try {
        // 发送订阅请求到/ws/{client_id}端点
        const message = {
          ...request
        };
        
        this.socket.send(JSON.stringify(message));
        console.log('订阅请求已发送:', request);
        resolve();
      } catch (error) {
        console.error('发送订阅请求失败:', error);
        reject(error);
      }
    });
  }

  // 监听特定事件
  on(event: string, callback: (data: any) => void) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)?.push(callback);
  }

  // 发送消息
  send(data: any) {
    if (this.isConnectedFlag && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('WebSocket未连接，无法发送消息');
    }
  }

  // 断开连接（仅在应用关闭时调用）
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnectedFlag = false;
      this.connectionPromise = null;
      console.log('WebSocket连接已断开');
    }
  }

  // 获取客户端ID
  getClientId(): string {
    return this.clientId;
  }

  // 检查是否已连接
  isConnected(): boolean {
    return this.isConnectedFlag && this.socket?.readyState === WebSocket.OPEN;
  }
}

// 创建并导出WebSocket服务实例
const websocketService = new WebSocketService();
export default websocketService;