import React, { useState } from 'react';
import { Layout, Menu, Input, Button, Space } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  ReloadOutlined,
  BellOutlined
} from '@ant-design/icons';
import './Layout.css';

const { Header, Content, Sider } = Layout;
const { Search } = Input;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const onSearch = (value: string) => {
    console.log('搜索内容:', value);
  };

  return (
    <Layout className="main-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        className="sidebar"
      >
        <div className="logo">
          {collapsed ? 'MS' : '管理系统'}
        </div>
        <Menu
          defaultSelectedKeys={['1']}
          mode="inline"
          className="sidebar-menu"
        >
          <Menu.Item key="1" icon={<PieChartOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="2" icon={<DesktopOutlined />}>
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
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout
        className={collapsed ? 'main-content main-content-collapsed' : 'main-content'}
      >
        <Header className="top-header">
          <div className="header-toolbar">
            <div className="search-container">
              <Search
                placeholder="输入搜索内容"
                onSearch={onSearch}
                style={{ width: '100%', maxWidth: 400 }}
                allowClear
              />
            </div>
            <Space size="middle">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => window.location.reload()}
              />
              <Button
                type="text"
                icon={<BellOutlined />}
              />
            </Space>
          </div>
        </Header>
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