import React, { useCallback, useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Layout, Button, Modal, Tooltip } from "antd";
import {
  DownloadOutlined,
  UploadOutlined,
  SettingFilled,
  BulbOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import ChatSider from "../../components/ChatSider/ChatSider";
import Header from "../../components/HeaderBar/HeaderBar";
import ExpBar from "../../components/exp-bar/exp-bar";
import ReactFlow from "reactflow";
import useFlowStore from "../../utils/flowStore";
import useUserStore from "../../utils/userStore";
import CustomNode from "../../components/CustomNode/CustomNode";
import ContextMenu from "../../components/ContextMenu/ContextMenu";
import DiagramMessage from "../../components/DiagramMessage/DiagramMessage";
import chatService from "../../utils/chatService";

import { getLayoutedElements } from "../../utils/prettyDia.js";
import SettingsModal from "../../components/SettingsModal/SettingsModal";
import QuestModal from "../../components/QuestModal/QuestModal";
import GuideModal from "../../components/GuideModal/GuideModal";
import ProfileModal from "../../components/ProfileModal/ProfileModal";
import Login from "../Login/Login";
import Register from "../Register/Register";

import "reactflow/dist/style.css";
import styles from "./MainApp.module.css";

const { Content } = Layout;

const nodeTypes = { custom: CustomNode };

const MainApp = () => {
  const [authStatus, setAuthStatus] = useState('loggedOut'); 
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    undo,
    redo,
    save,
    importFromFile,
    loadDiagram,
    setFlow,
    addNode,
    setIsSettingsOpen,
    setIsQuestOpen,
    chatWidth,
    setChatWidth, // setter 추가
    deleteMessage,
    editMessage,
    deleteNode,
    setEditingNodeId,
    updateEdgeLabel,
    theme,
    setTheme, // setter 추가
    customThemeColors,
    getCustomColorVarName,
    setRecommendations,
    setIsTyping,
    setChatFontSize, // setter 추가
    setMode, // setter 추가
    setAllCustomThemeColors, // setter 추가
  } = useFlowStore();
  const { setUserSettings } = useUserStore(); // userStore에서 setter 추가
  const reactFlowWrapper = useRef(null);
  const [chatLog, setChatLog] = useState([]);
  const fileInputRef = useRef(null);
  const isInitialMount = useRef(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [diagramMessage, setDiagramMessage] = useState(null);
  const [isDiagramMaking, setIsDiagramMaking] = useState(false);
  const [quests, setQuests] = useState(() => {
    const saved = localStorage.getItem("quests");
    return saved ? JSON.parse(saved) : [];
  });

  const [isSiderVisible, setIsSiderVisible] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isWelcomeModalVisible, setIsWelcomeModalVisible] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const toggleSider = () => {
    setIsSiderVisible(!isSiderVisible);
  };
  const [completedQuests, setCompletedQuests] = useState(() => {
    const saved = localStorage.getItem("completedQuests");
    return saved ? JSON.parse(saved) : [];
  });

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

  const validateToken = useCallback(async () => {
    // Welcome Modal 로직
    const hasVisitedBefore = localStorage.getItem("hasVisited");
    if (!hasVisitedBefore) {
      setIsWelcomeModalVisible(true);
      localStorage.setItem("hasVisited", "true");
    }

    const token = localStorage.getItem('authToken');
    const localConversationId = localStorage.getItem('conversationId');

    if (token) {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        if (localConversationId) {
          headers['X-Conversation-ID'] = localConversationId;
        }

        const response = await fetch('/api/user/me', { headers });
        
        if (response.ok) {
          const userData = await response.json();
          useUserStore.getState().login(userData);
          
          if (userData.conversationId) {
            setConversationId(userData.conversationId);
            localStorage.setItem('conversationId', userData.conversationId);
          }
          
          setAuthStatus('loggedIn');

          // --- NEW: 설정 동기화 로직 ---
          try {
            const settingsResponse = await fetch('/api/user/settings', { headers });
            if (settingsResponse.ok) {
              const settingsData = await settingsResponse.json();
              
              // 1. userStore에 마스터 데이터 저장
              setUserSettings(settingsData);

              // 2. 현재 세션(flowStore)에 설정 적용
              const { settings } = useUserStore.getState();
              if (settings.theme) setTheme(settings.theme);
              if (settings.chatWidth) setChatWidth(settings.chatWidth);
              if (settings.chatFontSize) setChatFontSize(settings.chatFontSize);
              if (settings.mode) setMode(settings.mode);
              // TODO: customThemeColors 전체를 설정하는 함수를 flowStore에 추가해야 함
            }
          } catch (error) {
            console.error("Failed to fetch user settings:", error);
          }
          // --- 로직 끝 ---

          // Fetch diagram data after successful login
          try {
            const diagramResponse = await fetch('/api/diagram', { headers });
            if (diagramResponse.ok && diagramResponse.status !== 204) {
              const diagram = await diagramResponse.json();
              if (diagram && diagram.diagram_data) {
                localStorage.setItem("diagram-data", diagram.diagram_data);
              } else {
                localStorage.removeItem("diagram-data");
              }
            } else {
              localStorage.removeItem("diagram-data");
            }
          } catch (error) {
            console.error("Failed to fetch diagram:", error);
            localStorage.removeItem("diagram-data");
          }

        } else {
          localStorage.removeItem('authToken');
          setAuthStatus('loggedOut');
        }
      } catch (error) {
        console.error("Token validation error:", error);
        setAuthStatus('loggedOut');
      }
    } else {
      setAuthStatus('loggedOut');
    }
    // Always load from local storage after attempting to validate and fetch.
    useFlowStore.getState().loadDiagramFromLocalStorage();
  }, [setTheme, setChatWidth, setChatFontSize, setMode, setUserSettings]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  useEffect(() => {
    console.log("Auth status is:", authStatus, "Setting up connection...");

    if (authStatus === null) return;

    chatService.disconnect(); 

    const handleChatHistoryLoaded = (history) => {
      console.log('Chat history loaded from DB:', history);
      setChatLog([...history]);
    };

    const onConnect = () => {
      const convId = localStorage.getItem('conversationId');
      if (convId) {
        chatService.loadChatHistory(convId);
      }
    };

    chatService.connect(
      (message) => {
        useFlowStore.getState().setIsTyping(false);
        setChatLog((prevChatLog) => [...prevChatLog, { id: Date.now(), content: message, sender: 'ai' }]);
      },
      onConnect
    );

    chatService.onChatHistoryLoaded(handleChatHistoryLoaded);

    return () => {
      chatService.offChatHistoryLoaded(handleChatHistoryLoaded);
      chatService.disconnect();
    };
  }, [authStatus]); 

  useEffect(() => {
    localStorage.setItem("quests", JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem("completedQuests", JSON.stringify(completedQuests));
  }, [completedQuests]);

  

  

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    if (theme === "custom") {
      customThemeColors.forEach((color, index) => {
        document.documentElement.style.setProperty(
          getCustomColorVarName(index),
          color
        );
      });
    } else {
      customThemeColors.forEach((_, index) => {
        document.documentElement.style.removeProperty(
          getCustomColorVarName(index)
        );
      });
    }
  }, [theme, customThemeColors, getCustomColorVarName]);

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

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const isConfirmed = window.confirm(
      "주의: 임포트하면 현재 작업 내용(다이어그램 및 대화)이 파일의 내용으로 덮어쓰여집니다. 계속하시겠습니까?"
    );

    if (!isConfirmed) {
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      return; 
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      const result = importFromFile(content);

      if (result.error) {
        alert(result.error);
      } else {
        if (result.chatHistory) {
          setChatLog(result.chatHistory);
        }
        if (result.quests) {
          setQuests(result.quests);
        }
        if (result.completedQuests) {
          setCompletedQuests(result.completedQuests);
        }

        // 데이터베이스에 임포트된 데이터 덮어쓰기 요청
        try {
          const token = localStorage.getItem('authToken');
          if (!token || authStatus !== 'loggedIn') {
            console.warn("Not logged in. Import will not be synced to the database.");
            return;
          }

          const { nodes, edges } = useFlowStore.getState();
          const diagramData = { nodes, edges };

          const response = await fetch('/api/user/import-request', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              diagramData,
              chatHistory: result.chatHistory || [],
              conversationId: conversationId, 
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to sync imported data.');
          }

          console.log('Imported data successfully synced to the database.');
          
        } catch (error) {
          console.error('Error syncing imported data:', error);
          alert(`An error occurred while syncing the imported file: ${error.message}`);
        }
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = null;
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
      type: "pane",
      x: event.clientX,
      y: event.clientY,
    });
  };

  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      event.stopPropagation(); // Stop event from bubbling up to the pane
      setContextMenu({
        type: "node",
        nodeId: node.id,
        x: event.clientX,
        y: event.clientY,
      });
    },
    [setContextMenu]
  );

  const onEdgeDoubleClick = useCallback(
    (event, edge) => {
      const newLabel = prompt("Enter new label for edge", edge.label);
      if (newLabel !== null) {
        updateEdgeLabel(edge.id, newLabel);
      }
    },
    [updateEdgeLabel]
  );

  const onPaneClick = useCallback(() => setContextMenu(null), []);

  const onAddNode = useCallback((shape) => {
    if (contextMenu && reactFlowInstance && reactFlowWrapper.current) {
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: contextMenu.x - bounds.left,
        y: contextMenu.y - bounds.top,
      });
      addNode(position, shape);
      setContextMenu(null);
    }
  }, [reactFlowInstance, contextMenu, addNode]);

  const onRecommendationClick = (recommendation) => {
    const userMessage = {
      id: Date.now(),
      content: recommendation,
      sender: "user",
      hasCodeBlock: recommendation.includes("```"),
    };
    const newChatLog = [...chatLog, userMessage];
    setChatLog(newChatLog);
    chatService.sendMessage(recommendation, newChatLog);
  };

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
      const { nodes: layoutedNodes, edges: layoutedEdges } = 
        getLayoutedElements(diagram.nodes, diagram.edges);

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

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthStatus('loggedOut');
  };

  if (authStatus === 'loggedOut') {
    if (authView === 'login') {
      return <Login onLoginSuccess={validateToken} onGuestLogin={() => setAuthStatus('guest')} switchToRegister={() => setAuthView('register')} />; 
    } else {
      return <Register switchToLogin={() => setAuthView('login')} />; 
    }
  }

  return (
    <Layout style={{ height: "100dvh" }}>
      <Helmet>
        <title>Antinomy | AI 채팅 및 다이어그램</title>
        <meta name="description" content="AI와 대화하며 생각을 정리하고, 실시간으로 다이어그램을 생성하여 아이디어를 시각화하세요. Antinomy는 당신의 복잡한 문제 해결과 기획을 돕는 파트너입니다." />
        <meta property="og:title" content="Antinomy | AI 채팅 및 다이어그램" />
        <meta property="og:description" content="AI와 대화하며 생각을 정리하고, 실시간으로 다이어그램을 생성하여 아이디어를 시각화하세요." />
        <meta property="og:url" content="https://syncro.tg-antinomy.kro.kr/app" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header className={styles["header"]} toggleSider={toggleSider} authStatus={authStatus} onLogout={handleLogout} />
      <Layout>
        <ChatSider
          className={`${styles["chat-sider"]} ${ 
            isSiderVisible ? styles.visible : "" 
          }`}
          isSiderVisible={isSiderVisible}
          chatWidth={chatWidth}
          messages={chatLog}
          setMessages={setChatLog}
          onGenerateDiagram={handleGenerateDiagram}
          isDiagramMaking={isDiagramMaking}
          onResetQuests={handleResetQuests}
          onDelete={(messageId) => deleteMessage(messageId, setChatLog)}
          onEdit={(messageId, newText) =>
            editMessage(messageId, newText, setChatLog)
          }
          conversationId={conversationId}
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
                onNodeContextMenu={onNodeContextMenu}
                onEdgeDoubleClick={onEdgeDoubleClick}
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
                className={styles["tail-button"]}
                type="default"
                icon={<DownloadOutlined />}
                onClick={handleLoadClick}
                style={{ right: "7.5rem" }}
              >
                Import
              </Button>
              <Tooltip
                title={
                  authStatus !== "loggedIn" ? "로그인이 필요한 기능입니다." : ""
                }
              >
                <span
                  className={styles["tail-button"]}
                  style={{ right: "0.9375rem" }}
                >
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
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
                        userInput.trim() === "" 
                          ? defaultName 
                          : userInput.trim();

                      const sanitizedFilenameBase = filenameBase
                        .replace(/[\\/:*?'"<>|]/g, "_")
                        .replace(/\.json$/i, "");

                      const diagramFilename = `${sanitizedFilenameBase}.antinomy.json`;

                      save(diagramFilename, chatLog, quests, completedQuests);
                    }}
                    disabled={authStatus !== "loggedIn"}
                  >
                    Export
                  </Button>
                </span>
              </Tooltip>
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
              onRecommendationClick={onRecommendationClick}
            />
            <ProfileModal />
          </Content>
        </Layout>
      </Layout>

      {contextMenu && (
        <ContextMenu
          {...contextMenu}
          onAddNode={onAddNode}
          onDeleteNode={(nodeId) => {
            deleteNode(nodeId);
            setContextMenu(null);
          }}
          onEditNode={(nodeId) => {
            setEditingNodeId(nodeId);
            setContextMenu(null);
          }}
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
        <p>
          Antinomy는 문제 해결을 위한 아이디어를 시각적으로 정리하고 발전시키는
          데 도움을 주는 AI입니다.
        </p>
        <p>사용법이 궁금하신가요? 가이드를 확인해 보세요.</p>
      </Modal>
    </Layout>
  );
};

export default MainApp;
