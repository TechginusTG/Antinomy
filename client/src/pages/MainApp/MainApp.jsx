import React, { useCallback, useState, useEffect, useRef } from "react";
import { Layout, Button, Modal, Checkbox, Slider } from "antd";
import {
  SaveOutlined,
  FolderOpenOutlined,
  SettingFilled,
  BulbOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import ChatSider from "../../components/ChatSider/ChatSider";
import Header from "../../components/HeaderBar/HeaderBar";
import ExpBar from "../../components/exp-bar/exp-bar";
import ReactFlow from "reactflow";
import useFlowStore from "../../utils/flowStore";
import CustomNode from "../../components/CustomNode/CustomNode";
import ContextMenu from "../../components/ContextMenu/ContextMenu";
import DiagramMessage from "../../components/DiagramMessage/DiagramMessage";
import chatService from "../../utils/chatService";

import SettingsModal from "../../components/SettingsModal/SettingsModal";
import QuestModal from "../../components/QuestModal/QuestModal";

import "reactflow/dist/style.css";
import styles from "./MainApp.module.css";

const { Content } = Layout;

const nodeTypes = { custom: CustomNode };

const MainApp = () => {
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
    addNode,
    isSettingsOpen,
    setIsSettingsOpen,
    isQuestOpen,
    setIsQuestOpen,
    chatWidth,
  } = useFlowStore();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const reactFlowWrapper = useRef(null);
  const [chatLog, setChatLog] = useState([]);
  const fileInputRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [diagramMessage, setDiagramMessage] = useState(null);
  const [isDiagramMaking, setIsDiagramMaking] = useState(false);
  const [quests, setQuests] = useState([]);

  const [isSiderVisible, setIsSiderVisible] = useState(false);

  const toggleSider = () => {
    setIsSiderVisible(!isSiderVisible);
  };
  const [completedQuests, setCompletedQuests] = useState([]);

  const handleResetQuests = () => {
    setQuests([]);
    setCompletedQuests([]);
  };

  const handleQuestChange = (index, checked) => {
    if (checked) {
      setCompletedQuests([...completedQuests, index]);
    } else {
      setCompletedQuests(completedQuests.filter((i) => i !== index));
    }
  };

  useEffect(() => {
    const initialChat = loadFlow();
    if (initialChat) {
      setChatLog(initialChat);
    }
    // Set initial theme
    document.body.setAttribute("data-theme", theme);
  }, []);

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
        alert(
          "Failed to load file. It might be corrupted or not a valid JSON file."
        );
      } finally {
        // Reset the file input to allow reloading the same file.
        if (fileInputRef.current) {
          fileInputRef.current.value = null;
        }
      }
    };
    reader.readAsText(file);
  };

  const handleLoadClick = () => {
    fileInputRef.current.click();
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const onPaneClick = useCallback(() => setContextMenu(null), []);

  const onAddNode = useCallback(() => {
    if (contextMenu && reactFlowInstance && reactFlowWrapper.current) {
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: contextMenu.x - bounds.left,
        y: contextMenu.y - bounds.top,
      });
      addNode(position);
      setContextMenu(null);
    }
  }, [reactFlowInstance, contextMenu, addNode]);

  const handleGenerateDiagram = () => {
    if (chatLog.length === 0) {
      alert(
        "아직 아무런 대화도 하지 않았어요. 다이어그램을 생성하려면 먼저 AI와 대화를 시작하세요."
      );
      return;
    }
    setDiagramMessage("다이어그램 생성 중...");
    setIsDiagramMaking(true);
    const payload = {
      chatLog: chatLog,
      diagramState: { nodes, edges },
    };
    chatService.makeDiagram(payload, (diagram) => {
      setFlow(diagram);
      if (diagram.quests) {
        setQuests(diagram.quests);
      }
      setDiagramMessage("다이어그램을 생성했습니다.");
      setIsDiagramMaking(false);
      setTimeout(() => {
        setDiagramMessage(null);
      }, 3000);
    });
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Header className={styles["header"]} toggleSider={toggleSider} />
      <Layout>
        <ChatSider
          className={`${styles["chat-sider"]} ${
            isSiderVisible ? styles.visible : ""
          }`}
          chatWidth={chatWidth}
          messages={chatLog}
          setMessages={setChatLog}
          onGenerateDiagram={handleGenerateDiagram}
          isDiagramMaking={isDiagramMaking}
          onResetQuests={handleResetQuests}
        />
        <Layout className={styles["content-layout"]}>
          <Content className={styles["main-content"]}>
            <div
              ref={reactFlowWrapper}
              className={styles["react-flow-wrapper"]}
              onContextMenu={handleContextMenu}
            >
              <DiagramMessage message={diagramMessage} />
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onPaneClick={onPaneClick}
                onInit={setReactFlowInstance}
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
                style={{ right: "7.5rem" }}
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
                style={{ right: "0.9375rem" }}
              >
                Save
              </Button>
            </div>
            <div className={styles["settings-button"]}>
              <Button
                type="default"
                icon={<SettingFilled />}
                onClick={() => setIsSettingsOpen(true)}
              />
            </div>
            <div className={styles["quest-button"]}>
              <Button
                type="default"
                icon={<BulbOutlined />}
                onClick={() => setIsQuestOpen(true)}
              />
            </div>
            <ExpBar />

            <SettingsModal />
            <QuestModal
              quests={quests}
              completedQuests={completedQuests}
              handleQuestChange={handleQuestChange}
            />
          </Content>
        </Layout>
      </Layout>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAddNode={onAddNode}
          onClose={() => setContextMenu(null)}
        />
      )}
    </Layout>
  );
};

export default MainApp;
