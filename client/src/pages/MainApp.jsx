import React, { useState } from 'react';
import { Layout, Button, Input, Space } from 'antd';
import {
  UnorderedListOutlined,
  ArrowsAltOutlined,
  SaveOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  SendOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;

const MainApp = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout>
      <Sider
        width={300}
        collapsible
        collapsed={collapsed}
        trigger={null}
        theme="light"
        collapsedWidth={0}
      >
        {!collapsed && (
          <div>
            <div>
              <h3>Chat</h3>
              <Space>
                <button>Reset</button> {/*btn for clear chatLog*/}
                <button>Make Diagram</button> {/*btn for make diagram*/}
              </Space>
            </div>
            <div>
              {/* Chat messages will go here */}
            </div>
            <div>
              <Input.TextArea
                autoSize={{ minRows: 1, maxRows: 5 }}
                placeholder="Type a message..."
              />
              <Button icon={<SendOutlined />} type="primary" />
            </div>
          </div>
        )}
      </Sider>
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
