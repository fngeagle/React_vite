import React from 'react';
import MainLayout from './components/Layout';
import Dashboard from './pages/Dashboard';
import 'antd/dist/reset.css';

const App: React.FC = () => {
  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
};

export default App;
