import React from "react";
import { Modal, Button } from "antd";
import useFlowStore from "../../utils/flowStore";
import useUserStore from "../../utils/userStore";
import { useNavigate } from 'react-router-dom';

const ProfileModal = () => {
  const { isProfileModalOpen, setIsProfileModalOpen } = useFlowStore();
  const { username, logout } = useUserStore(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsProfileModalOpen(false);
    navigate('/');
  };

  return (
    <Modal
      title="Profile"
      open={isProfileModalOpen}
      onCancel={() => setIsProfileModalOpen(false)}
      footer={null} 
    >
      <p>Username: <b>{username}</b></p>
      <Button type="primary" danger onClick={handleLogout}>
        Logout
      </Button>
    </Modal>
  );
};

export default ProfileModal;
