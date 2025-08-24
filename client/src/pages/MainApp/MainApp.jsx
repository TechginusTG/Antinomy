import React, { useCallback, useState, useEffect, useRef } from "react";
import { Layout, Button, Modal } from "antd";
import {
  SaveOutlined,
  FolderOpenOutlined,
  SettingFilled,
  BulbOutlined,
  QuestionCircleOutlined,
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

import { getLayoutedElements } from "../../utils/prettyDia.js";
import SettingsModal from "../../components/SettingsModal/SettingsModal";
import QuestModal from "../../components/QuestModal/QuestModal";
import GuideModal from "../../components/GuideModal/GuideModal";

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
    setIsSettingsOpen,
    setIsQuestOpen,
    chatWidth,
    deleteMessage,
    editMessage,
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
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isWelcomeModalVisible, setIsWelcomeModalVisible] = useState(false);

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
    const loadedData = loadFlow();
    if (loadedData) {
      setChatLog(loadedData.chatHistory);
      chatService.loadChatHistory(loadedData.chatHistory);
      if(loadedData.quests) {
        setQuests(loadedData.quests);
      }
      if(loadedData.completedQuests) {
        setCompletedQuests(loadedData.completedQuests);
      }
    }

    const hasVisitedBefore = localStorage.getItem('hasVisitedBefore');
    if (!hasVisitedBefore) {
      setIsWelcomeModalVisible(true);
      localStorage.setItem('hasVisitedBefore', 'true');
    }

    document.body.setAttribute("data-theme", theme);
  }, []);

  const handleCloseGuide = () => {
    setIsGuideOpen(false);
  };

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
        let data = JSON.parse(content);

        // Check for old format and migrate
        if (data.chatHistory && data.chatHistory.length > 0 && data.chatHistory[0].text !== undefined) {
          data.chatHistory = data.chatHistory.map((msg, index) => ({
            id: msg.id || Date.now() + index, // Use existing id or create new one
            content: msg.text,
            sender: msg.sender,
          }));
        }

        if (data.diagramData && data.chatHistory) {
          setFlow(data.diagramData);
          setChatLog(data.chatHistory);
          if (data.quests) {
            setQuests(data.quests);
          }
          if (data.completedQuests) {
            setCompletedQuests(data.completedQuests);
          }
          localStorage.setItem("chatLog", JSON.stringify(data.chatHistory));
          chatService.loadChatHistory(data.chatHistory);
        } else {
          alert("Invalid file format.");
        }
      } catch (error) {
        console.error("Failed to load or parse file:", error);
        alert(
          "Failed to load file. It might be corrupted or not a valid JSON file."
        );
      } finally {
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
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        diagram.nodes,
        diagram.edges
      );
      
      setFlow({ nodes: layoutedNodes, edges: layoutedEdges });

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

  const handleWelcomeOk = () => {
    setIsWelcomeModalVisible(false);
    setIsGuideOpen(true);
  };

  const handleWelcomeCancel = () => {
    setIsWelcomeModalVisible(false);
  };

  return (
    <Layout style={{ height: "100dvh" }}>
      <Header className={styles["header"]} toggleSider={toggleSider} />
      <Layout>
        <ChatSider
          className={`${styles["chat-sider"]} ${isSiderVisible ? styles.visible : ""}`}
          isSiderVisible={isSiderVisible}
          chatWidth={chatWidth}
          messages={chatLog}
          setMessages={setChatLog}
          onGenerateDiagram={handleGenerateDiagram}
          isDiagramMaking={isDiagramMaking}
          onResetQuests={handleResetQuests}
          onDelete={(messageId) => deleteMessage(messageId, setChatLog)}
          onEdit={(messageId, newText) => editMessage(messageId, newText, setChatLog)}
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
                    .replace(/[\\/:*?'"<>|]/g, "_")
                    .replace(/\.json$/i, "");

                  const diagramFilename = `${sanitizedFilenameBase}.antinomy.json`;

                  save(diagramFilename, quests, completedQuests);
                }}
                style={{ right: "0.9375rem" }}
              >
                Save
              </Button>
            </div>
            <div className={styles["action-buttons"]}>
              <Button
                type="default"
                icon={<SettingFilled />}
                onClick={() => setIsSettingsOpen(true)}
              />
              <Button
                type="default"
                icon={<BulbOutlined />}
                onClick={() => setIsQuestOpen(true)}
              />
              <Button
                type="default"
                icon={<QuestionCircleOutlined />}
                onClick={() => setIsGuideOpen(true)}
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
      <GuideModal isOpen={isGuideOpen} onClose={handleCloseGuide} />

      <Modal
        title="Antinomy에 오신 것을 환영합니다!"
        open={isWelcomeModalVisible}
        onOk={handleWelcomeOk}
        onCancel={handleWelcomeCancel}
        okText="가이드 보기"
        cancelText="닫기"
      >
        <p>Antinomy는 문제 해결을 위한 아이디어를 시각적으로 정리하고 발전시키는 데 도움을 주는 AI입니다.</p>
        <p>사용법이 궁금하신가요? 가이드를 확인해 보세요.</p>
      </Modal>
    </Layout>
  );
};

export default MainApp;
