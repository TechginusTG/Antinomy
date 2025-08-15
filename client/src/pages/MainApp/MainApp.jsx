import React, { useCallback, useState, useEffect, useRef } from "react";
import { Layout, Button, Modal } from "antd";
import { SaveOutlined, FolderOpenOutlined, SettingFilled, BulbOutlined } from "@ant-design/icons";
import ChatSider from "../../components/ChatSider/ChatSider";
import Header from "../../components/HeaderBar/HeaderBar";
import ExpBar from "../../components/exp-bar/exp-bar";
import ReactFlow from "reactflow";
import useFlowStore from "../../utils/flowStore";
// import chatService from "../../utils/chatService";

import { Slider } from "antd";

import "reactflow/dist/style.css";
import styles from "./MainApp.module.css";

const { Content } = Layout;

const MainApp = () => {
  const [theme, setTheme] = useState("light");
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    undo,
    redo,
    save,
    loadFlow,
    setFlow,
  } = useFlowStore();

  const [chatLog, setChatLog] = useState([]);
  const [chatWidth, setChatWidth] = useState(30);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const initialChat = loadFlow();
    if (initialChat) {
      setChatLog(initialChat);
    }
  }, [loadFlow]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === "z") {
        undo();
      }
      if (event.ctrlKey && event.key === "y") {
        redo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  const themeChange = (e) => {
    setTheme(e.target.value);
    document.body.setAttribute("data-theme", e.target.value);
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuestOpen, setIsQuestOpen] = useState(false);

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);
  const openQuest = () => setIsQuestOpen(true);
  const closeQuest = () => setIsQuestOpen(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const data = JSON.parse(content);

        if (data.diagramData && data.chatHistory) {
          setFlow(data.diagramData);
          setChatLog(data.chatHistory);
          localStorage.setItem("chatLog", JSON.stringify(data.chatHistory));
        } else {
          alert("Invalid file format.");
        }
      } catch (error) {
        console.error("Failed to load or parse file:", error);
        alert("Failed to load file. It might be corrupted or not a valid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleLoadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Header className={styles["header"]} />
      <Layout>
        <ChatSider
          className={styles["chat-sider"]}
          chatWidth={chatWidth}
          messages={chatLog}
          setMessages={setChatLog}
        />
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
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileSelect}
                accept=".json"
              />
              <Button
                type="default"
                icon={<FolderOpenOutlined />}
                onClick={handleLoadClick}
                style={{ marginRight: 110 }}
              >
                Load
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => {
                  const defaultName = "flow-diagram";
                  const userInput = prompt(
                    "저장할 파일 이름을 입력하세요:",
                    defaultName
                  );

                  if (userInput === null) {
                    return;
                  }

                  const filenameBase = 
                    userInput.trim() === "" ? defaultName : userInput.trim();

                  const sanitizedFilenameBase = filenameBase
                    .replace(/[\\/:*?"<>|]/g, "_")
                    .replace(/\.json$/i, "");

                  const diagramFilename = `${sanitizedFilenameBase}.json`;

                  save(diagramFilename);
                }}
              >
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
            <div className={styles["quest-button"]}>
              <Button
                type="default"
                icon={<BulbOutlined />}
                onClick={openQuest}
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
                  <label style={{ marginLeft: 16 }}>
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
                  <label style={{ marginLeft: 7 }}>
                    <input
                      type="radio"
                      value="natsu"
                      checked={theme === "natsu"}
                      onChange={themeChange}
                    />
                    Summer
                  </label>
                  <label style={{ marginLeft: 7 }}>
                    <input
                      type="radio"
                      value="aki"
                      checked={theme === "aki"}
                      onChange={themeChange}
                    />
                    Autumn
                  </label>
                  <label style={{ marginLeft: 7 }}>
                    <input
                      type="radio"
                      value="fuyu"
                      checked={theme === "fuyu"}
                      onChange={themeChange}
                    />
                    Winter
                  </label>
                </div>
                <div style={{ marginTop: 24 }}>
                  <p>
                    채팅창 너비: <b>{chatWidth}%</b>
                  </p>
                  <Slider
                    min={20}
                    max={50}
                    value={chatWidth}
                    onChange={setChatWidth}
                    style={{ width: 200 }}
                  />
                </div>
              </div>
            </Modal>
            <Modal
              title="Quest"
              open={isQuestOpen}
              onCancel={closeQuest}
              onOk={closeQuest}
            >
              <div>
                <p>퀘스트 내용</p>
              </div>
            </Modal>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MainApp;
