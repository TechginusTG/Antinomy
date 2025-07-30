import React, { useCallback } from "react";
import { Layout, Button } from "antd";
import { SaveOutlined, SettingFilled } from "@ant-design/icons";
import ChatSider from "../../components/ChatSider/ChatSider"; // Updated import path
import Header from "../../components/HeaderBar/HeaderBar"; // Updated import path
import ReactFlow, { useNodesState, useEdgesState, addEdge } from "reactflow";

import "reactflow/dist/style.css";
import styles from "./MainApp.module.css"; // Import CSS Module

const { Content } = Layout;

const initialNodes = [
    { id: "1", position: { x: 300, y: 200 }, data: { label: "Hello" } },
    { id: "2", position: { x: 400, y: 300 }, data: { label: "World" } },
];

const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const MainApp = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    return (
        <Layout style={{ height: "100vh" }}>
            <Header className={styles["header"]} />
            <Layout>
                <ChatSider className={styles["chat-sider"]} />
                <Layout className={styles["content-layout"]}>
                    <Content className={styles["main-content"]}>
                        <div className={styles["react-flow-wrapper"]}>
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                            />
                        </div>
                        <div className={styles["tail-buttons"]}>
                            <Button type="primary" icon={<SaveOutlined />}>
                                Save
                            </Button>
                            <Button icon={<SettingFilled />} />
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default MainApp;
