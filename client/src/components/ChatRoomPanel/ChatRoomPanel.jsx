
import React, { useState, useEffect, useRef } from 'react';
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
  onRenameChatRoom,
  onDeleteChatRoom,
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const panelRef = useRef(null);

  const handleContextMenu = (event, roomId) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      roomId,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    if (contextMenu) {
      document.addEventListener('click', closeContextMenu);
      return () => {
        document.removeEventListener('click', closeContextMenu);
      };
    }
  }, [contextMenu]);

  return (
    <>
      <div ref={panelRef} className={`${styles.panel} ${visible ? styles.visible : ''}`}>
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
              onContextMenu={(e) => handleContextMenu(e, room.id)}
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
      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div
            className={styles.menuItem}
            onClick={() => {
              onRenameChatRoom(contextMenu.roomId);
              closeContextMenu();
            }}
          >
            Rename
          </div>
          <div
            className={styles.menuItem}
            onClick={() => {
              onDeleteChatRoom(contextMenu.roomId);
              closeContextMenu();
            }}
          >
            Delete
          </div>
        </div>
      )}
    </>
  );
};

export default ChatRoomPanel;
