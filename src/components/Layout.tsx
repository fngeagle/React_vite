import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  PieChartOutlined,
  DesktopOutlined
} from '@ant-design/icons';
import './Layout.css';

const { Content, Sider } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
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
          defaultSelectedKeys={['1']}
          mode="inline"
          className="sidebar-menu"
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