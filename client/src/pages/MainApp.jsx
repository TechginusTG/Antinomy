import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import ChatSider from '../components/ChatSider';

const { Content } = Layout;

const MainApp = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout>
      <ChatSider collapsed={collapsed} />
      <Layout>
        <Button
          onClick={toggleCollapsed}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        />
        <Content>
          <Button icon={<AppstoreOutlined />} />
          <div>{/* Main content goes here */}</div>
          <Button type="primary" icon={<SaveOutlined />}>
            Save
          </Button>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainApp;
