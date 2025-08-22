
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
    <React.Fragment>
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
        style={{ flexGrow: 1 }}
      />
      <Button
        icon={<SendOutlined />}
        type="primary"
        onClick={handleSendMessage}
      />
    </React.Fragment>
  );
};

export default ChatInput;
