import React from 'react';
import { Tooltip } from 'antd';
import useFlowStore from '../../utils/flowStore';
import styles from './ConnectionStatus.module.css';

const ConnectionStatus = () => {
  const isConnected = useFlowStore((state) => state.isConnected);
  const tooltipText = isConnected ? '서버에 연결됨' : '서버에 연결되지 않음';

  return (
    <Tooltip title={tooltipText}>
      <div 
        className={`${styles.statusIndicator} ${isConnected ? styles.connected : styles.disconnected}`}
      />
    </Tooltip>
  );
};

export default ConnectionStatus;
