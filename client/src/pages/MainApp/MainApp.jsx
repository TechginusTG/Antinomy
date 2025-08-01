import React, { useCallback, useState } from "react";
import { Layout, Button, Modal } from "antd";
import { SaveOutlined, SettingFilled } from "@ant-design/icons";
import ChatSider from "../../components/ChatSider/ChatSider"; // Updated import path
import Header from "../../components/HeaderBar/HeaderBar"; // Updated import path
import ExpBar from "../../components/exp-bar/exp-bar";
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
    const [theme, setTheme] = useState("light");

    const themeChange = (e) => {
        setTheme(e.target.value);
        document.body.setAttribute("data-theme", e.target.value);
    };

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
                                icon={<SettingFilled/>}
                                onClick={openSettings}
                            />
                        </div>
                        <ExpBar />
                        <Modal
                            title="Settings"
                            open={isSettingsOpen}
                            onCancel={closeSettings}
                            onOk={closeSettings}
                        >
                            <div>
                                <p>Choose your Theme:</p>
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            value="light"
                                            checked={theme === "light"}
                                            onChange={themeChange}
                                        />
                                        Light
                                    </label>
                                    <label style={{marginLeft: 16}}>
                                        <input
                                            type="radio"
                                            value="dark"
                                            checked={theme === "dark"}
                                            onChange={themeChange}
                                        />
                                        Dark
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            value="haru"
                                            checked={theme === "haru"}
                                            onChange={themeChange}
                                        />
                                        Spring
                                    </label>
                                    <label style={{marginLeft: 7}}>
                                        <input
                                            type="radio"
                                            value="natsu"
                                            checked={theme === "natsu"}
                                            onChange={themeChange}
                                        />
                                        Summer
                                    </label>
                                    <label style={{marginLeft: 7}}>
                                        <input
                                            type="radio"
                                            value="aki"
                                            checked={theme === "aki"}
                                            onChange={themeChange}
                                        />
                                        Autumn
                                    </label>
                                    <label style={{marginLeft: 7}}>
                                        <input
                                            type="radio"
                                            value="fuyu"
                                            checked={theme === "fuyu"}
                                            onChange={themeChange}
                                        />
                                        Winter
                                    </label>
                                </div>
                            </div>
                        </Modal>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default MainApp;
