import React from 'react';
import { Layout } from 'antd';
import ConnectionStatus from '../ConnectionStatus/ConnectionStatus';
import styles from './HeaderBar.module.css';

const HeaderBar = ({ className }) => {
  return (
    <Layout.Header className={`${styles.header} ${className}`}>
      <div className={styles.titleContainer}>
        <h2>ANTINOMY</h2>
        <ConnectionStatus />
      </div>
    </Layout.Header>
  );
};

export default React.memo(HeaderBar);