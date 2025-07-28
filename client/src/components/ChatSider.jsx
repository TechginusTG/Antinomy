import React from 'react';
import { Layout, Button, Input, Space } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { Sider } = Layout;

const ChatSider = ({ collapsed }) => {
  return (
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
  );
};

export default ChatSider;
