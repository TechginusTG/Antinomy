import React, { useState, useRef } from 'react';
import { Input, Button, Dropdown, Menu, Checkbox } from 'antd';
import { SendOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './ChatInput.module.css';

const ChatInput = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const [attachDiagram, setAttachDiagram] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage({
        text: inputValue,
        options: {
          attachDiagram: attachDiagram,
        },
      });
      setInputValue('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      // 파일 업로드 로직은 여기에 추가될 예정입니다.
      // 예: onSendMessage({ file: file });
    }
    e.target.value = null;
  };

  const handleAttachFileClick = () => {
    fileInputRef.current.click();
  };

  const menu = (
    <Menu>
      {/* 메뉴가 닫히는 것을 방지하기 위해 이벤트 전파를 중단합니다. */}
      <Menu.Item key="1" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={attachDiagram}
          onChange={(e) => setAttachDiagram(e.target.checked)}
        >
          다이어그램 첨부
        </Checkbox>
      </Menu.Item>
      <Menu.Item key="2" onClick={handleAttachFileClick}>
        첨부파일
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.chatInputContainer}>
      <Dropdown overlay={menu} trigger={['click']}>
        <Button icon={<PlusOutlined />} className={styles.plusButton} />
      </Dropdown>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*,video/*"
      />
      <Input.TextArea
        autoSize={{ minRows: 1, maxRows: 5 }}
        placeholder="Type a message..."
        value={inputValue}
        onChange={handleInputChange}
        onPressEnter={(e) => {
          if (!e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        className={styles.chatTextArea}
      />
      <Button
        icon={<SendOutlined className={styles.sendIcon} />}
        onClick={handleSendMessage}
        className={styles.sendButton}
      />
    </div>
  );
};

export default ChatInput;
