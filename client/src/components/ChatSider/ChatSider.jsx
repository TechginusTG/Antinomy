import { Layout, Button, Input, Modal, Checkbox } from "antd";
import { SendOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import React, { useState, useEffect, useRef } from "react"; 

import Bubble from "../ChatBubble/Bubble";
import styles from "./ChatSider.module.css";
import chatService from "../../utils/chatService";
import useFlowStore from "../../utils/flowStore";

const { Sider } = Layout;

const ChatSider = ({ className, chatWidth, messages, setMessages, onGenerateDiagram, isDiagramMaking, onResetQuests }) => {
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const { resetFlow, increaseExp } = useFlowStore();
    const chatLogRef = useRef(null); 

    const [diagramResetModal, setDiagramResetModal] = useState({ visible: false, dontShowAgain: false });
    const [allResetModal, setAllResetModal] = useState({ visible: false, dontShowAgain: false });

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
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        localStorage.setItem("chatLog", JSON.stringify(messages));
    }, [messages]);

    const sendMessage = () => {
        if (inputValue.trim()) {
            const userMessage = { text: inputValue, sender: "user" };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            chatService.sendMessage(inputValue);
            setInputValue("");
            setIsTyping(true);
            increaseExp(5); 
        }
    };

    const runDiagramReset = () => resetFlow();

    const handleDiagramResetClick = () => {
        if (sessionStorage.getItem('suppressDiagramResetConfirm') === 'true') {
            runDiagramReset();
        } else {
            setDiagramResetModal({ visible: true, dontShowAgain: false });
        }
    };

    const handleDiagramResetOk = () => {
        if (diagramResetModal.dontShowAgain) {
            sessionStorage.setItem('suppressDiagramResetConfirm', 'true');
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
        resetFlow();
        onResetQuests();
    };

    const handleAllResetClick = () => {
        if (sessionStorage.getItem('suppressAllResetConfirm') === 'true') {
            runAllReset();
        } else {
            setAllResetModal({ visible: true, dontShowAgain: false });
        }
    };

    const handleAllResetOk = () => {
        if (allResetModal.dontShowAgain) {
            sessionStorage.setItem('suppressAllResetConfirm', 'true');
        }
        runAllReset();
        setAllResetModal({ visible: false, dontShowAgain: false });
    };

    const handleAllResetCancel = () => {
        setAllResetModal({ visible: false, dontShowAgain: false });
    };

    const modalTitle = (text) => (
        <div style={{ display: 'flex', alignItems: 'center'}}>
            <ExclamationCircleFilled style={{ color: '#faad14', marginRight: '8px', fontSize: '22px'}} />
            <span>{text}</span>
        </div>
    );


    return (
        <Sider width={`${chatWidth}%`} theme="light" className={className}>
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
                        {messages.map((msg, index) => (
                            <Bubble key={index} className={`${styles.bubble} ${styles[msg.sender]}`}>
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
                    <Button icon={<SendOutlined />} type="primary" onClick={sendMessage} />
                </div>
            </div>

            <Modal
                title={modalTitle("다이어그램을 리셋하시겠습니까?")}
                open={diagramResetModal.visible}
                onOk={handleDiagramResetOk}
                onCancel={handleDiagramResetCancel}
                okText="리셋"
                cancelText="취소"
                okType="danger"
            >
                <p>현재 다이어그램의 모든 노드와 연결이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</p>
                <Checkbox 
                    checked={diagramResetModal.dontShowAgain}
                    onChange={(e) => setDiagramResetModal({ ...diagramResetModal, dontShowAgain: e.target.checked })}
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
            >
                <p>채팅 기록, 다이어그램, 퀘스트 등 모든 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.</p>
                <Checkbox 
                    checked={allResetModal.dontShowAgain}
                    onChange={(e) => setAllResetModal({ ...allResetModal, dontShowAgain: e.target.checked })}
                >
                    다시 표시하지 않음
                </Checkbox>
            </Modal>
        </Sider>
    );
};

export default ChatSider;