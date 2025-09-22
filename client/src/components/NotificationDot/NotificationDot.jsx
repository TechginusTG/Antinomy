import React from 'react';
import styles from './NotificationDot.module.css';

const NotificationDot = ({ children, show }) => {
  return (
    <div className={styles['notification-wrapper']}>
      {children}
      {show && <div className={styles.dot}></div>}
    </div>
  );
};

export default NotificationDot;
