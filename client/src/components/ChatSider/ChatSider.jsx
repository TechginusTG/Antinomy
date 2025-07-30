import { Layout, Button, Input, Space, Row, Col } from "antd";
import { SendOutlined } from "@ant-design/icons";

import Bubble from "../ChatBubble/Bubble";
import styles from "./ChatSider.module.css";

const { Sider } = Layout;

const ChatSider = ({ className }) => {
    return (
        <Sider width={300} theme="light" className={className}>
            <div className={styles.chat}>
                <div className={styles["chat-header"]}>
                    <Button>Reset</Button> {/*btn for clear chatLog*/}
                    <Button>Make Diagram</Button> {/*btn for make diagram*/}
                </div>
                <div className={styles["chat-log"]}>
                    <ul>
                        <Bubble className={`${styles.bubble} ${styles.user}`}>
                            안녕하세요!!!!!
                        </Bubble>
                        <Bubble className={`${styles.bubble} ${styles.ai}`}>
                            왜 안녕하신가요?
                        </Bubble>
                    </ul>
                    {/* Chat messages will go here */}
                </div>
                <div className={styles["chat-footer"]}>
                    <Input.TextArea
                        autoSize={{ minRows: 1, maxRows: 5 }}
                        placeholder="Type a message..."
                    />
                    <Button icon={<SendOutlined />} type="primary" />
                </div>
            </div>
        </Sider>
    );
};

export default ChatSider;
