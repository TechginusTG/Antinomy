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

  const handleChangePassword = () => {

  };

  const handleDeleteAccount = () => {

  };

  return (
    <Modal
      title="Profile"
      open={isProfileModalOpen}
      onCancel={() => setIsProfileModalOpen(false)}
      footer={null} 
    >
      <div>
        <p>Username: <b>{username}</b></p>
        <Button type="primary" danger onClick={handleLogout}>
          Logout
        </Button>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <Button>비밀번호 변경</Button>
          <Button type="danger">회원 탈퇴</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
