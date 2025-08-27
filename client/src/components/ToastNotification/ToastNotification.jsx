import React, { useState, useEffect } from 'react';
import styles from './ToastNotification.module.css';

const ToastNotification = ({ message, isVisible, onHide }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  return (
    <div className={`${styles.toast} ${isVisible ? styles.show : ''}`}>
      {message}
    </div>
  );
};

export default ToastNotification;
