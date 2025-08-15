import React from 'react';
import styles from './ContextMenu.module.css';

const ContextMenu = ({ x, y, onAddNode, onClose }) => {
  const handleAddNodeClick = () => {
    onAddNode();
    onClose();
  };

  return (
    <div
      className={styles.contextMenu}
      style={{ top: y, left: x }}
      onContextMenu={(e) => e.preventDefault()} 
    >
      <div className={styles.menuItem} onClick={handleAddNodeClick}>
        Add node...
      </div>
    </div>
  );
};

export default ContextMenu;