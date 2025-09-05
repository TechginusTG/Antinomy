import React, { useState } from "react";
import { Modal, Button, message } from "antd";
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

  const handleChangePassword = async () => {
    try {
      const values = await passwordChangeForm.validateFields();
      const { currentPassword, newPassword } = values;
      
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        message.success(data.message || '비밀번호 변경에 성공했습니다.');
        setShowChangePasswordForm(false);
        passwordChangeForm.resetFields();
      } else {
        message.error(data.message || '비밀번호 변경에 실패했습니다.');
      }
    } catch (errorInfo) {
      message.error('비밀번호 변경 중 오류가 발생했습니다.');
      if (errorInfo.errorFields) {
        message.error('입력값을 확인해주세요.');
      } else {
        message.error('비밀번호 변경 중 알 수 없는 오류가 발생했습니다.');
      }
    }
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
          <Button type="primary" onClick={handleChangePassword}>비밀번호 변경하기</Button>
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
