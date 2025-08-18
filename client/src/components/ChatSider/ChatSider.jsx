import { Layout, Button, Input } from "antd";
import { SendOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";

import Bubble from "../ChatBubble/Bubble";
import styles from "./ChatSider.module.css";
import chatService from "../../utils/chatService";
import useFlowStore from "../../utils/flowStore";

const { Sider } = Layout;

const ChatSider = ({ className, chatWidth, messages, setMessages, onGenerateDiagram, isDiagramMaking }) => {
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const { updateUrlHash, resetFlow } = useFlowStore();

    useEffect(() => {
        const handleNewMessage = (message) => {
            setIsTyping(false);
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: message, sender: "ai" },
            ]);
        };

        chatService.connect(handleNewMessage, () => {});

        return () => {
            chatService.disconnect();
        };
    }, [setMessages]);

    useEffect(() => {
        localStorage.setItem("chatLog", JSON.stringify(messages));
        updateUrlHash();
    }, [messages, updateUrlHash]);

    const sendMessage = () => {
        if (inputValue.trim()) {
            const userMessage = { text: inputValue, sender: "user" };
            setMessages((prevMessages) => [...prevMessages, userMessage]);

            chatService.sendMessage(inputValue);

            setInputValue("");
            setIsTyping(true);
        }
    };

    const handleResetDiagram = () => {
        resetFlow();
    };

    const handleResetAll = () => {
        setMessages([]);
        localStorage.removeItem("chatLog");
        resetFlow();
    };

    return (
        <Sider width={`${chatWidth}%`} theme="light" className={className}>
            <div className={styles.chat}>
                <div className={styles["chat-header"]}>
                    <div className={styles.resetContainer}>
                        <span className={styles.resetText}>Reset</span>
                        <div className={styles.hiddenButtons}>
                            <Button onClick={handleResetDiagram}>Diagram</Button>
                            <Button onClick={handleResetAll}>All</Button>
                        </div>
                    </div>
                    <Button onClick={onGenerateDiagram} disabled={isDiagramMaking}>
                        {isDiagramMaking ? "Making..." : "Make Diagram"}
                    </Button>
                </div>
                <div className={styles["chat-log"]}>
                    <ul>
                        {messages.map((msg, index) => (
                            <Bubble
                                key={index}
                                className={`${styles.bubble} ${styles[msg.sender]}`}
                            >
                                {msg.text}
                            </Bubble>
                        ))}
                        {isTyping && (
                            <Bubble className={`${styles.bubble} ${styles.ai}`}>
                                AI가 생각중이에요...
                            </Bubble>
                        )}
                    </ul>
                </div>
                <div className={styles["chat-footer"]}>
                    <Input.TextArea
                        autoSize={{ minRows: 1, maxRows: 5 }}
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onPressEnter={(e) => {
                            if (!e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                    />
                    <Button
                        icon={<SendOutlined />}
                        type="primary"
                        onClick={sendMessage}
                    />
                </div>
            </div>
        </Sider>
    );
};

export default ChatSider;
