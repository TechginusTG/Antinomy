import { Layout, Button, Input } from "antd";
import { SendOutlined } from "@ant-design/icons";
import React, { useState, useEffect } from "react";

import Bubble from "../ChatBubble/Bubble";
import styles from "./ChatSider.module.css";
import chatService from "../../utils/chatService";

const { Sider } = Layout;

const ChatSider = ({ className }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        // 서버로부터 메시지를 수신할 때 호출될 콜백 함수
        const handleNewMessage = (message) => {
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: message, sender: "ai" },
            ]);
        };

        // chatService에 연결하고 메시지 핸들러를 등록합니다.
        chatService.connect(handleNewMessage);

        // 컴포넌트가 언마운트될 때 연결을 끊습니다.
        return () => {
            chatService.disconnect();
        };
    }, []); // 이 effect는 컴포넌트 마운트 시 한 번만 실행됩니다.

    const sendMessage = () => {
        if (inputValue.trim()) {
            const userMessage = { text: inputValue, sender: "user" };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            chatService.sendMessage(inputValue);
            setInputValue("");
        }
    };

    return (
        <Sider width={300} theme="light" className={className}>
            <div className={styles.chat}>
                <div className={styles["chat-header"]}>
                    <Button>Reset</Button>
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
