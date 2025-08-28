
import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const ChatInput = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', width: '100%' }}>
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
        style={{ flexGrow: 1, resize: 'none' }}
      />
      <Button
        icon={<SendOutlined style={{ color: '#1e90ff', fontSize: 16 }} />}
        type="primary"
        onClick={handleSendMessage}
        style={{ height: 40, flexShrink: 0, 
          backgroundColor: '#ffffff',
          borderColor: '#d9d9d9',
          boxShadow: 'none',
        }}
      />
    </div>
  );
};

export default ChatInput;
