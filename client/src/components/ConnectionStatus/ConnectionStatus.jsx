import React from 'react';
import useFlowStore from '../../utils/flowStore';
import styles from './ConnectionStatus.module.css';

const ConnectionStatus = () => {
  const isConnected = useFlowStore((state) => state.isConnected);

  return (
    <div 
      className={`${styles.statusIndicator} ${isConnected ? styles.connected : styles.disconnected}`}
      title={isConnected ? 'Connected' : 'Disconnected'}
    />
  );
};

export default ConnectionStatus;
