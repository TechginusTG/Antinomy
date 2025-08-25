import React, { useEffect } from "react";
import styles from "./ContextMenu.module.css";

const ContextMenu = ({
  type,
  nodeId,
  x,
  y,
  onAddNode,
  onDeleteNode,
  onEditNode,
  onClose,
}) => {
  const handleAddNodeClick = () => {
    onAddNode();
    onClose();
  };

  const handleDeleteNodeClick = () => {
    onDeleteNode(nodeId);
    onClose();
  };

  const handleEditNodeClick = () => {
    onEditNode(nodeId);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (type === 'node') {
        if (e.key === 'e' || e.key === 'E') {
          handleEditNodeClick();
        }
        if (e.key === 'x' || e.key === 'X') {
          handleDeleteNodeClick();
        }
      } else if (type === 'pane') {
        if (e.key === 'a' || e.key === 'A') {
          handleAddNodeClick();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [type, handleEditNodeClick, handleDeleteNodeClick, handleAddNodeClick]);

  return (
    <div
      className={styles.contextMenu}
      style={{ top: y, left: x }}
      onContextMenu={(e) => e.preventDefault()}
      onClick={onClose} // Close on any click inside the menu that doesn't lead to an action
    >
      {type === "node" && (
        <>
          <div className={styles.menuItem} onClick={handleEditNodeClick}>
            노드 편집 (E)
          </div>
          <div className={styles.menuItem} onClick={handleDeleteNodeClick}>
            노드 삭제 (X)
          </div>
        </>
      )}
      {type === "pane" && (
        <div className={styles.menuItem} onClick={handleAddNodeClick}>
          노드 추가... (A)
        </div>
      )}
    </div>
  );
};

export default ContextMenu;
