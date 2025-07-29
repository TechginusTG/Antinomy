import React from "react";
import { Layout, Button, Input, Space, Row, Col } from "antd";
import { SendOutlined, MenuFoldOutlined } from "@ant-design/icons";

import styles from './ChatSider.module.css';

const { Sider } = Layout;

const ChatSider = ({ collapsed, className, onClose }) => {
    return (
        <Sider
            width={300}
            collapsible
            collapsed={collapsed}
            trigger={null}
            theme="light"
            collapsedWidth={0}
            className={className}
        >
            {!collapsed && (
                <div className={styles.chat}>
                    <div className={styles['chat-header']}>
                        <h3 className={styles['chat-header-title']}>Chat</h3>
                        <Space className={styles['chat-header-btn']}>
                            <Button>Reset</Button> {/*btn for clear chatLog*/}
                            <Button>Make Diagram</Button>{" "}
                            {/*btn for make diagram*/}
                            <Button
                                icon={<MenuFoldOutlined />}
                                onClick={onClose}
                            />
                        </Space>
                    </div>
                    <div className={styles['chat-log']}>
                        <ul></ul>
                        {/* Chat messages will go here */}
                    </div>
                    <div className={styles['chat-footer']}>
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
