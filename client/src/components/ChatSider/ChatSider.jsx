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
  onLike,
  likedChatIds,
  isSiderVisible,
  activeChatRoomId,
  recommendations,
  onRecommendationClick,
  onClearRecommendations,
  chatRoomName,
}) => {
  const { chatWidth, setChatWidth, chatFontSize, isTyping, setIsTyping } =
    useFlowStore();
  const chatLogRef = useRef(null);

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
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (message) => {
    const userMessage = {
      id: Date.now(),
      content: message.text,
      sender: "user",
      options: message.options,
    };
    const newChatLog = [...messages, userMessage];
    setMessages(newChatLog);
    chatService.sendMessage(userMessage, newChatLog, activeChatRoomId);
    setIsTyping(true);
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
          {chatRoomName && (
            <h3 className={styles.chatRoomName}>{chatRoomName}</h3>
          )}
          <Button onClick={onGenerateDiagram} disabled={isDiagramMaking}>
            {isDiagramMaking ? "Making..." : "Make Diagram"}
          </Button>
        </div>
        <div className={styles["chat-log"]} ref={chatLogRef}>
          <ul>
            <li style={{ listStyle: "none", textAlign: "center" }}>
              <i>해결하고픈 문제나 고민, 하고싶은 일을 적어보세요</i>
            </li>
            {messages.filter(Boolean).map((msg) => (
              <Bubble
                key={msg.id}
                id={msg.id}
                className={`${styles.bubble} ${styles[msg.sender]}`}
                isUser={msg.sender === "user"}
                onDelete={onDelete}
                onEdit={() => onEdit(msg)}
                onLike={onLike}
                isLiked={likedChatIds.has(msg.id)}
                chatWidth={chatWidth}
                isMobile={isMobile}
                chatFontSize={chatFontSize}
              >
                {msg.isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    AI가 생각중이에요...
                  </motion.div>
                ) : msg.sender === "ai" ? (
                  <div className={styles.markdownContent}>
                    <ReactMarkdown>
                      {msg.content.replace(/KEYWORDS:.*/s, "").trim()}
                    </ReactMarkdown>
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
            onRecommendationClick={onRecommendationClick}
            onClearRecommendations={onClearRecommendations}
          />
          <ChatInput onSendMessage={sendMessage} key={activeChatRoomId} />
        </div>
      </div>

      <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
    </Sider>
  );
};

export default ChatSider;
