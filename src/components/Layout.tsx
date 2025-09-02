import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  PieChartOutlined,
  DesktopOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';

const { Content, Sider } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case '1':
        navigate('/');
        break;
      case '2':
        navigate('/Dashboard');
        break;
      default:
        break;
    }
  };

  return (
    <Layout className="main-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        className="sidebar"
      >
        <div className="logo_header">
          <div className="logo">
            {collapsed ? 'MS' : '期货管理系统'}
          </div>
        </div>
        <Menu
          selectedKeys={[location.pathname === '/Dashboard' ? '2' : '1']}
          mode="inline"
          className="sidebar-menu"
          onClick={handleMenuClick}
        >
          <Menu.Item key="1" icon={<DesktopOutlined />}>
            期货管理
          </Menu.Item>
          <Menu.Item key="2" icon={<PieChartOutlined />}>
            Dashboard
          </Menu.Item>
          {/* <Menu.Item key="2" icon={<DesktopOutlined />}>
            数据分析
          </Menu.Item>
          <Menu.Item key="3" icon={<UserOutlined />}>
            用户管理
          </Menu.Item>
          <Menu.Item key="4" icon={<TeamOutlined />}>
            团队管理
          </Menu.Item>
          <Menu.Item key="5" icon={<FileOutlined />}>
            文件管理
          </Menu.Item> */}
        </Menu>
      </Sider>
      <Layout
        className={collapsed ? 'main-content main-content-collapsed' : 'main-content'}
      >
        <Content className="content-wrapper">
          <div className="content">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;