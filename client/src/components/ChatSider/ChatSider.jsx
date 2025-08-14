import { Layout, Button, Input } from "antd";
import { SendOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";

import Bubble from "../ChatBubble/Bubble";
import styles from "./ChatSider.module.css";
import chatService from "../../utils/chatService";

const { Sider } = Layout;

const ChatSider = ({ className }) => {
    const [messages, setMessages] = useState(() => {
        const savedMessages = localStorage.getItem("chatLog");
        return savedMessages ? JSON.parse(savedMessages) : [];
    });
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        const handleNewMessage = (message) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: message, sender: "ai" },
            ]);
        };

        chatService.connect(handleNewMessage);

        return () => {
            chatService.disconnect();
        };
    }, []);

    useEffect(() => {
        localStorage.setItem("chatLog", JSON.stringify(messages));
    }, [messages]);

    const sendMessage = () => {
        if (inputValue.trim()) {
            const userMessage = { text: inputValue, sender: "user" };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            chatService.sendMessage(inputValue);
            setInputValue("");
        }
    };

    const handleReset = () => {
        setMessages([]);
        localStorage.removeItem("chatLog");
    };

    return (
        <Sider width="30%" theme="light" className={className}>
            <div className={styles.chat}>
                <div className={styles["chat-header"]}>
                    <Button onClick={handleReset}>Reset</Button>
                    <Button>Make Diagram</Button>
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
