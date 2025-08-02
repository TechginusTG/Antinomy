import { Layout, Button, Input, Space, Row, Col } from "antd";
import { SendOutlined } from "@ant-design/icons";
import React, { useState } from "react";

import Bubble from "../ChatBubble/Bubble";
import styles from "./ChatSider.module.css";

const { Sider } = Layout;

const ChatSider = ({ className }) => {
    const [messages, setMessages] = useState([
        { text: "안녕하세요!!!!!", sender: "user"},
        { text: "왜 안녕하신가요?", sender: "ai"},
    ]);
    const [inputValue, setInputValue] = useState("");

    const SendMessage = () => {
        if (inputValue.trim()) {
            setMessages([...messages, { text: inputValue, sender: "user"}]);
            setInputValue("");
        }
    };

    return (
        <Sider width={300} theme="light" className={className}>
            <div className={styles.chat}>
                <div className={styles["chat-header"]}>
                    <Button>Reset</Button> {/*btn for clear chatLog*/}
                    <Button>Make Diagram</Button> {/*btn for make diagram*/}
                </div>
                <div className={styles["chat-log"]}>
                    <ul>
                        {/* <Bubble className={`${styles.bubble} ${styles.user}`}>
                            안녕하세요!!!!!
                        </Bubble>
                        <Bubble className={`${styles.bubble} ${styles.ai}`}>
                            왜 안녕하신가요?
                        </Bubble> */}
                        {messages.map((msg, index) => (
                            <Bubble
                                key={index}
                                className={`${styles.bubble} ${styles[msg.sender]}`}
                            >
                                {msg.text}
                            </Bubble>
                        ))}
                    </ul>
                    {/* Chat messages will go here */}
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
                                SendMessage();
                            }
                        }}
                    />
                    <Button 
                        icon={<SendOutlined />} 
                        type="primary" 
                        onClick={SendMessage}
                    />
                </div>
            </div>
        </Sider>
    );
};

export default ChatSider;
