import React, { useState } from "react";
import { Modal, Button } from "antd";
import useFlowStore from "../../utils/flowStore";
import useUserStore from "../../utils/userStore";
import { useNavigate } from 'react-router-dom';
import { Form, Input } from 'antd';

const ProfileModal = () => {
  const { isProfileModalOpen, setIsProfileModalOpen } = useFlowStore();
  const { username, logout } = useUserStore(); 
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [passwordChangeForm] = Form.useForm();
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
      {showChangePasswordForm && (
        <Form
          form={passwordChangeForm}
          layout="vertical"
          name="password_change_form"
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            label="현재 비밀번호"
            name="currentPassword"
            rules={[{ required: true, message: '현재 비밀번호를 입력해주세요!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="새 비밀번호"
            name="newPassword"
            rules={[{ required: true, message: '새 비밀번호를 입력해주세요!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="새 비밀번호 확인"
            name="confirmNewPassword"
            dependencies={['newPassword']}
            hasFeedback
            rules={[
              { required: true, message: '새 비밀번호를 다시 입력해주세요!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('새 비밀번호가 일치하지 않습니다!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary">비밀번호 변경하기</Button>
          <Button style={{ marginLeft: '8px' }} onClick={() => setShowChangePasswordForm(false)}>취소</Button>
        </Form>
      )}
      <div>
        <p>Username: <b>{username}</b></p>
        <Button type="primary" danger onClick={handleLogout}>
          Logout
        </Button>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}>비밀번호 변경</Button>
          <Button type="danger">회원 탈퇴</Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
