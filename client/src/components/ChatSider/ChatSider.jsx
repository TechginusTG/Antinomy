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
  onLike,
  likedChatIds,
  isSiderVisible,
  activeChatRoomId,
}) => {
  const {
    chatWidth,
    setChatWidth,
    resetFlow,
    recommendations,
    clearRecommendations,
    setRecommendations,
    chatFontSize,
    isTyping,
    setIsTyping,
  } = useFlowStore();
  const chatLogRef = useRef(null);

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
    chatService.sendMessage(message, newChatLog, activeChatRoomId);
    setIsTyping(true);
  };

  const handleOpenEditModal = (message) => {
    setEditingMessage(message);
    setEditingText(message.content);
  };

  const handleModalEditSave = () => {
    if (!editingMessage) return;

    const editedMessageIndex = messages.findIndex(
      (msg) => msg.id === editingMessage.id
    );
    if (editedMessageIndex === -1) return;

    const truncatedMessages = messages.slice(0, editedMessageIndex + 1);

    truncatedMessages[editedMessageIndex] = {
      ...truncatedMessages[editedMessageIndex],
      content: editingText,
    };

    setMessages(truncatedMessages);

    chatService.editMessage(editingMessage.id, editingText, activeChatRoomId);

    setEditingMessage(null);
    setEditingText("");
    setIsTyping(true);
  };

  const handleModalCancel = () => {
    setEditingMessage(null);
    setEditingText("");
  };

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
          <Button onClick={onGenerateDiagram} disabled={isDiagramMaking}>
            {isDiagramMaking ? "Making..." : "Make Diagram"}
          </Button>
        </div>
        <div className={styles["chat-log"]} ref={chatLogRef}>
          <ul>
            {messages.map((msg) => (
              <Bubble
                key={msg.id}
                id={msg.id}
                className={`${styles.bubble} ${styles[msg.sender]}`}
                isUser={msg.sender === "user"}
                onDelete={onDelete}
                onEdit={() => handleOpenEditModal(msg)}
                onLike={onLike}
                isLiked={likedChatIds.has(msg.id)}
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
            ))}
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
          <ChatInput onSendMessage={sendMessage} key={activeChatRoomId} />
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

      <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
    </Sider>
  );
};

export default ChatSider;
