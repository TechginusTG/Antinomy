import React from 'react';
import styles from './GuideModal.module.css';

const GuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Antinomy 사용 가이드</h2>
        <p>
          {/* 이 부분에 원하시는 가이드 내용을 추가하시면 됩니다. */}
          가이드 내용이 여기에 들어갑니다.
        </p>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default GuideModal;
