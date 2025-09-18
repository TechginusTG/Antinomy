import React, { useState, useEffect } from 'react';
import { Modal, List, Typography, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import useFlowStore from '../../utils/flowStore';
import chatService from '../../utils/chatService';

const { Text } = Typography;

const LikedMessagesModal = ({ onUnlike }) => {
  const { isLikedMessagesModalOpen, setIsLikedMessagesModalOpen } = useFlowStore();
  const [likedMessages, setLikedMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLikedMessagesModalOpen) {
      setLoading(true);
      chatService.getLikedMessages()
        .then(messages => {
          setLikedMessages(messages);
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to load liked messages:", err);
          setLoading(false);
        });
    }
  }, [isLikedMessagesModalOpen]);

  const handleCancel = () => {
    setIsLikedMessagesModalOpen(false);
  };

  const handleUnlikeClick = async (chatId) => {
    const success = await onUnlike(chatId);
    if (success) {
      setLikedMessages(prevMessages => prevMessages.filter(msg => msg.id !== chatId));
    }
  };

  return (
    <Modal
      title="Liked Messages"
      open={isLikedMessagesModalOpen}
      onCancel={handleCancel}
      width={600}
      footer={null}
    >
      <List
        loading={loading}
        itemLayout="vertical"
        dataSource={likedMessages}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <Button
                icon={<DeleteOutlined />}
                onClick={() => handleUnlikeClick(item.id)}
                danger
              >
                Unlike
              </Button>
            ]}
          >
            <List.Item.Meta
              title={`Liked on: ${new Date(item.liked_at).toLocaleString()}`}
              description={`Mode: ${item.mode}`}
            />
            <Text>{item.message.replace(/KEYWORDS:.*/s, '').trim()}</Text>
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default LikedMessagesModal;