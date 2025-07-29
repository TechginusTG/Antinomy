import React, { useState, useCallback } from "react";
import { Layout, Button, Row } from "antd";
import {
    MenuUnfoldOutlined,
    AppstoreOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import ChatSider from "../../components/ChatSider/ChatSider"; // Updated import path
import ReactFlow, {
    useNodesState,
    useEdgesState,
    addEdge,
} from "reactflow";

import "reactflow/dist/style.css";
import styles from './MainApp.module.css'; // Import CSS Module

const { Content } = Layout;

const initialNodes = [
    { id: "1", position: { x: 0, y: 0 }, data: { label: "Hello" } },
    { id: "2", position: { x: 100, y: 100 }, data: { label: "World" } },
];

const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const MainApp = () => {
    const [collapsed, setCollapsed] = useState(true);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const openSider = () => setCollapsed(false);
    const closeSider = () => setCollapsed(true);

    return (
        <Layout className={styles['main-layout']}>
            <ChatSider
                collapsed={collapsed}
                className={styles['chat-sider']}
                onClose={closeSider}
            />
            <Layout className={styles['content-layout']}>
                <Content className={styles['main-content']}>
                    <div className={styles['main-content-header']}>
                        {collapsed && (
                            <Button
                                onClick={openSider}
                                icon={<MenuUnfoldOutlined />}
                            />
                        )}
                        <Row>
                            <Button icon={<AppstoreOutlined />} />
                            <Button type="primary" icon={<SaveOutlined />}>
                                Save
                            </Button>
                        </Row>
                    </div>
                    <div className={styles['react-flow-wrapper']}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                        />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainApp;
