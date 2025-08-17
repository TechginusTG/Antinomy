import { Layout, Button, Input } from "antd";
import { SendOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";

import Bubble from "../ChatBubble/Bubble";
import styles from "./ChatSider.module.css";
import chatService from "../../utils/chatService";
import useFlowStore from "../../utils/flowStore";

const { Sider } = Layout;

const ChatSider = ({ className, chatWidth, messages, setMessages }) => {
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isDiagramMaking, setIsDiagramMaking] = useState(false);
    const { nodes, edges, setFlow, updateUrlHash, resetFlow } = useFlowStore();

    useEffect(() => {
        const handleNewMessage = (message) => {
            setIsTyping(false);
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: message, sender: "ai" },
            ]);
        };

        const handleDiagramCreated = (diagram) => {
            console.log("Diagram created:", diagram);
            setFlow(diagram);
            setIsDiagramMaking(false); // 다이어그램 생성 완료
        };

        chatService.connect(handleNewMessage, handleDiagramCreated);

        return () => {
            chatService.disconnect();
        };
    }, [setMessages, setFlow]);

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

    const handleReset = () => {
        setMessages([]);
        localStorage.removeItem("chatLog");
        resetFlow();
    };

    const handleMakeDiagram = () => {
        setIsDiagramMaking(true); // 다이어그램 생성 시작
        const payload = {
            chatLog: messages,
            diagramState: { nodes, edges },
        };
        chatService.makeDiagram(payload);
        setIsTyping(true); // AI가 다이어그램을 만드는 동안에도 "생각중"을 표시
    };

    return (
        <Sider width={`${chatWidth}%`} theme="light" className={className}>
            <div className={styles.chat}>
                <div className={styles["chat-header"]}>
                    <Button onClick={handleReset}>Reset</Button>
                    <Button onClick={handleMakeDiagram} disabled={isDiagramMaking}>
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
