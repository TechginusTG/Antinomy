import React from 'react';
import styles from './DiagramMessage.module.css';

const DiagramMessage = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.message}>{message}</div>
    </div>
  );
};

export default DiagramMessage;
