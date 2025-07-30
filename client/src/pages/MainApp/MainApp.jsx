import React, { useCallback, useState } from "react";
import { Layout, Button, Modal } from "antd";
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

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const openSettings = () => setIsSettingsOpen(true);
    const closeSettings = () => setIsSettingsOpen(false);

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
                        </div>
                        <div className={styles["settings-button"]}>
                            <Button
                                type="default"
                                icon={<SettingFilled />}
                                onClick={openSettings}
                            />
                        </div>
                        <div className={styles["exp-bar"]}>
                            <div
                                className={styles["exp-bar-fill"]}
                                style={{ width: "60%" }} // 예시로 exp 60%
                            />
                            <span className={styles["exp-bar-label"]}>Exp {Math.round(60)}%</span>
                        </div>
                        <Modal
                            title="Setting"
                            open={isSettingsOpen}
                            onCancel={closeSettings}
                            onOk={closeSettings}
                        >
                        <p>설정 내용(추가예정)</p>
                        </Modal>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default MainApp;
