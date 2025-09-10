import React, { useState } from "react";
import { Modal, Button, message } from "antd";
import useFlowStore from "../../utils/flowStore";
import useUserStore from "../../utils/userStore";
import { useNavigate } from 'react-router-dom';
import { Form, Input } from 'antd';
import styles from "./ProfileModal.module.css";

const ProfileModal = () => {
  const { isProfileModalOpen, setIsProfileModalOpen } = useFlowStore();
  const { username, logout } = useUserStore(); 
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [passwordChangeForm] = Form.useForm();
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [deleteAccountForm] = Form.useForm();
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

  const handleDeleteAccount = async () => {
    try {
      const values = await deleteAccountForm.validateFields();
      const { passwordConfirm } = values;

      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ passwordConfirm })
      });

      const data = await response.json();

      if (response.ok) {
        message.success(data.message || "회원 탈퇴에 성공했습니다.");
        setShowDeleteAccountConfirm(false);
        deleteAccountForm.resetFields();

        logout();
        setIsProfileModalOpen(false);
        navigate('/');
      } else {
        message.error(data.message || '회원 탈퇴에 실패했습니다.');
      }
    } catch (errorInfo) {
      console.error('회원 탈퇴 중 오류 발생:', errorInfo);
      if (errorInfo.errorFields) {
        message.error('비밀번호를 입력해주세요.');
      } else {
        message.error('회원 탈퇴 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  return (
    <Modal
      title="Profile"
      open={isProfileModalOpen}
      onCancel={() => setIsProfileModalOpen(false)}
      footer={null} 
      wrapClassName={styles.modalOverride}
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
          <Button type="danger" onClick={() => setShowDeleteAccountConfirm(true)}>회원 탈퇴</Button>
        </div>
      </div>
      <Modal
        title="회원 탈퇴"
        open={showDeleteAccountConfirm}
        onOk={handleDeleteAccount}
        onCancel={() => setShowDeleteAccountConfirm(false)}
        okText="탈퇴하기"
        cancelText="취소"
        okButtonProps={{ danger: true }}
      >
        <p>정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
        <p>모든 데이터(채팅 기록, 다이어그램 등)가 삭제됩니다.</p>
        <Form form={deleteAccountForm} layout="vertical" style={{ marginTop: '15px' }}>
          <Form.Item
            label="비밀번호 확인"
            name="passwordConfirm"
            rules={[{ required: true, message: "탈퇴를 위해 비밀번호를 입력해주세요." }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default ProfileModal;
