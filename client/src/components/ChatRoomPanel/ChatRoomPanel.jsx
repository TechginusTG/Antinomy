
import React from 'react';
import { Button } from "antd";
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './ChatRoomPanel.module.css';

const ChatRoomPanel = ({
  visible,
  onClose,
  chatRooms,
  activeChatRoomId,
  onSelectChatRoom,
  onNewChat,
}) => {
  return (
    <div className={`${styles.panel} ${visible ? styles.visible : ''}`}>
      <div className={styles.header}>
        <h3>Chat Rooms</h3>
        <Button
          icon={<CloseOutlined />}
          onClick={onClose}
          className={styles.closeButton}
        />
      </div>
      <div className={styles.chatRoomList}>
        {chatRooms.map((room) => (
          <div
            key={room.id}
            className={`${styles.chatRoomItem} ${
              activeChatRoomId === room.id ? styles.active : ''
            }`}
            onClick={() => onSelectChatRoom(room.id)}
          >
            {room.title}
          </div>
        ))}
      </div>
      <div className={styles.footer}>
        <Button icon={<PlusOutlined />} onClick={onNewChat} block>
          New Chat
        </Button>
      </div>
    </div>
  );
};

export default ChatRoomPanel;
