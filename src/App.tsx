import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FuturesManagement from './pages/FuturesManagement';
import WebSocketExample from './components/WebSocketExample';
import websocketService from './services/websocketService';
import 'antd/dist/reset.css';

const App: React.FC = () => {
  // 应用启动时连接WebSocket
  useEffect(() => {
    websocketService.connect()
      .then(() => {
        console.log('应用启动：WebSocket连接成功');
      })
      .catch((error) => {
        console.error('应用启动：WebSocket连接失败:', error);
      });

    // 应用关闭时断开WebSocket连接
    return () => {
      websocketService.disconnect();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout><FuturesManagement /></MainLayout>} />
        <Route path="/Dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/WebSocketExample" element={<MainLayout><WebSocketExample /></MainLayout>} />
      </Routes>
    </Router>
  );
};

export default App;
