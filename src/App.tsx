import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FuturesManagement from './pages/FuturesManagement';
import WebSocketExample from './components/WebSocketExample';
import 'antd/dist/reset.css';

const App: React.FC = () => {
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
