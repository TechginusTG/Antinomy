import { Layout, Button, Input, Modal, Checkbox } from "antd";
import {
  SendOutlined,
  ExclamationCircleFilled,
  DownOutlined,
} from "@ant-design/icons";
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

import { motion } from "framer-motion";
import Bubble from "../ChatBubble/Bubble";
import styles from "./ChatSider.module.css";
import chatService from "../../utils/chatService";
import useFlowStore from "../../utils/flowStore";
import ChatInput from "../ChatInput/ChatInput";
import RecommendationList from "../RecommendationList/RecommendationList";

const { Sider } = Layout;

const ChatSider = ({
  className,
  messages,
  setMessages,
  onGenerateDiagram,
  isDiagramMaking,
  onResetQuests,
  onDelete,
  onEdit,
  isSiderVisible,
  conversationId,
}) => {
  const {
    chatWidth,
    setChatWidth,
    resetFlow,
    increaseExp,
    recommendations,
    clearRecommendations,
    setRecommendations,
    chatFontSize,
    isTyping,
    setIsTyping,
  } = useFlowStore();
  const chatLogRef = useRef(null);

  const [diagramResetModal, setDiagramResetModal] = useState({
    visible: false,
    dontShowAgain: false,
  });
  const [allResetModal, setAllResetModal] = useState({
    visible: false,
    dontShowAgain: false,
  });

  const [editingMessage, setEditingMessage] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const newWidth = (e.clientX / window.innerWidth) * 100;
      const minWidth = 20;
      const maxWidth = 50;
      const clampedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
      setChatWidth(Math.round(clampedWidth));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, setChatWidth]);

  const handleScroll = () => {
    if (chatLogRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatLogRef.current;
      setShowScrollToBottom(scrollTop + clientHeight < scrollHeight - 20);
    }
  };

  useEffect(() => {
    const chatLogElement = chatLogRef.current;
    if (chatLogElement) {
      chatLogElement.addEventListener("scroll", handleScroll);
      return () => {
        chatLogElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleNewRecommendations = (newRecommendations) => {
      setRecommendations(newRecommendations);
    };

    chatService.onNewRecommendations(handleNewRecommendations);

    return () => {
      chatService.offNewRecommendations(handleNewRecommendations);
    };
  }, [setRecommendations]);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (message) => {
    const userMessage = {
      id: Date.now(),
      content: message,
      sender: "user",
    };
    const newChatLog = [...messages, userMessage];
    setMessages(newChatLog);
    // Pass the full chat log and conversationId to chatService.sendMessage
    chatService.sendMessage(message, newChatLog, conversationId);
    setIsTyping(true);
  };

  const handleOpenEditModal = (message) => {
    setEditingMessage(message);
    setEditingText(message.content);
  };

  const handleModalEditSave = () => {
    if (!editingMessage) return;
    setIsTyping(true);
    onEdit(editingMessage.id, editingText);
    setEditingMessage(null);
    setEditingText("");
  };

  const handleModalCancel = () => {
    setEditingMessage(null);
    setEditingText("");
  };

  const runDiagramReset = () => resetFlow();

  const handleDiagramResetClick = () => {
    if (sessionStorage.getItem("suppressDiagramResetConfirm") === "true") {
      runDiagramReset();
    } else {
      setDiagramResetModal({ visible: true, dontShowAgain: false });
    }
  };

  const handleDiagramResetOk = () => {
    if (diagramResetModal.dontShowAgain) {
      sessionStorage.setItem("suppressDiagramResetConfirm", "true");
    }
    runDiagramReset();
    setDiagramResetModal({ visible: false, dontShowAgain: false });
  };

  const handleDiagramResetCancel = () => {
    setDiagramResetModal({ visible: false, dontShowAgain: false });
  };

  const runAllReset = () => {
    setMessages([]);
    localStorage.removeItem("chatLog");
    chatService.resetChat();
    resetFlow();
    onResetQuests();
  };

  const handleAllResetClick = () => {
    if (sessionStorage.getItem("suppressAllResetConfirm") === "true") {
      runAllReset();
    } else {
      setAllResetModal({ visible: true, dontShowAgain: false });
    }
  };

  const handleAllResetOk = () => {
    if (allResetModal.dontShowAgain) {
      sessionStorage.setItem("suppressAllResetConfirm", "true");
    }
    runAllReset();
    setAllResetModal({ visible: false, dontShowAgain: false });
  };

  const handleAllResetCancel = () => {
    setAllResetModal({ visible: false, dontShowAgain: false });
  };

  const modalTitle = (text) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <ExclamationCircleFilled
        style={{ color: "#faad14", marginRight: "8px", fontSize: "22px" }}
      />
      <span>{text}</span>
    </div>
  );

  const mobileClassName = isMobile
    ? `${styles.mobileSider} ${
        isSiderVisible ? styles.mobileSiderVisible : styles.mobileSiderHidden
      }`
    : "";

  return (
    <Sider
      width={isMobile ? "100%" : `${chatWidth}%`}
      theme="light"
      className={`${className} ${mobileClassName}`}
      collapsed={false}
      collapsedWidth={0}
    >
      <div className={styles.chat}>
        <div className={styles["chat-header"]}>
          <div className={styles.resetContainer}>
            <span className={styles.resetText}>Reset</span>
            <div className={styles.hiddenButtons}>
              <Button onClick={handleDiagramResetClick}>Diagram</Button>
              <Button onClick={handleAllResetClick}>All</Button>
            </div>
          </div>
          <Button onClick={onGenerateDiagram} disabled={isDiagramMaking}>
            {isDiagramMaking ? "Making..." : "Make Diagram"}
          </Button>
        </div>
        <div className={styles["chat-log"]} ref={chatLogRef}>
          <ul>
            <li style={{ listStyle: "none", textAlign: "center" }}>
              <i>해결하고픈 뭠제나, 고민, 하고싶은 일을 적어보세요</i>
            </li>
            {messages.map((msg) => {
              const getBubbleClass = (m) => {
                const text = m?.content || "";
                const length = text.length;
                // Prefer short center-styled bubbles for very short texts,
                // long bubbles for long texts. Thresholds adjustable.
                if (length <= 40)
                  return `${styles.bubble} ${styles[m.sender]} ${
                    styles.bubbleShort
                  }`;
                if (length >= 200)
                  return `${styles.bubble} ${styles[m.sender]} ${
                    styles.bubbleLong
                  }`;
                return `${styles.bubble} ${styles[m.sender]}`;
              };

              return (
                <Bubble
                  key={msg.id}
                  id={msg.id}
                  className={getBubbleClass(msg)}
                  isUser={msg.sender === "user"}
                  onDelete={onDelete}
                  onEdit={() => handleOpenEditModal(msg)}
                  chatWidth={chatWidth}
                  isMobile={isMobile}
                  chatFontSize={chatFontSize}
                >
                  {msg.sender === "ai" ? (
                    <div className={styles.markdownContent}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </Bubble>
              );
            })}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Bubble className={`${styles.bubble} ${styles.ai}`}>
                  AI가 생각중이에요...
                </Bubble>
              </motion.div>
            )}
          </ul>
        </div>
        {showScrollToBottom && (
          <Button
            className={styles["scroll-to-bottom-button"]}
            icon={<DownOutlined />}
            onClick={() => {
              if (chatLogRef.current) {
                chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
              }
            }}
          />
        )}
        <div className={styles["chat-footer"]}>
          <RecommendationList
            recommendations={recommendations}
            onRecommendationClick={(rec) => {
              sendMessage(rec);
              clearRecommendations();
            }}
            onClearRecommendations={clearRecommendations}
          />
          <ChatInput onSendMessage={sendMessage} key={messages.length} />
        </div>
      </div>

      <Modal
        title="메시지 수정"
        open={!!editingMessage}
        onOk={handleModalEditSave}
        onCancel={handleModalCancel}
        okText="수정"
        cancelText="취소"
        wrapClassName={styles.modalOverride}
      >
        <Input.TextArea
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          autoSize={{ minRows: 5, maxRows: 15 }}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleModalEditSave();
            }
          }}
        />
      </Modal>

      <Modal
        title={modalTitle("다이어그램을 리셋하시겠습니까?")}
        open={diagramResetModal.visible}
        onOk={handleDiagramResetOk}
        onCancel={handleDiagramResetCancel}
        okText="리셋"
        cancelText="취소"
        okType="danger"
        wrapClassName={styles.modalOverride}
      >
        <p>
          현재 다이어그램의 모든 노드와 연결이 삭제됩니다. 이 작업은 되돌릴 수
          없습니다.
        </p>
        <Checkbox
          checked={diagramResetModal.dontShowAgain}
          onChange={(e) =>
            setDiagramResetModal({
              ...diagramResetModal,
              dontShowAgain: e.target.checked,
            })
          }
        >
          다시 표시하지 않음
        </Checkbox>
      </Modal>

      <Modal
        title={modalTitle("모든 내용을 리셋하시겠습니까?")}
        open={allResetModal.visible}
        onOk={handleAllResetOk}
        onCancel={handleAllResetCancel}
        okText="모두 리셋"
        cancelText="취소"
        okType="danger"
        wrapClassName={styles.modalOverride}
      >
        <p>
          채팅 기록, 다이어그램, 퀘스트 등 모든 데이터가 삭제됩니다. 이 작업은
          되돌릴 수 없습니다.
        </p>
        <Checkbox
          checked={allResetModal.dontShowAgain}
          onChange={(e) =>
            setAllResetModal({
              ...allResetModal,
              dontShowAgain: e.target.checked,
            })
          }
        >
          다시 표시하지 않음
        </Checkbox>
      </Modal>
      <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
    </Sider>
  );
};

export default ChatSider;
