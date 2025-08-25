import React, { useState, useCallback, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import useFlowStore from '../../utils/flowStore';
import styles from './CustomNode.module.css';

const CustomNode = ({ id, data, selected }) => {
  const { updateNodeLabel, editingNodeId, setEditingNodeId } = useFlowStore();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  useEffect(() => {
    if (editingNodeId === id) {
      setIsEditing(true);
    }
  }, [editingNodeId, id]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    updateNodeLabel(id, label);
    setEditingNodeId(null); // Clear editing state
  };

  const handleChange = (evt) => {
    setLabel(evt.target.value);
  };

  const handleKeyDown = (evt) => {
    if (evt.key === 'Enter') {
      setIsEditing(false);
      updateNodeLabel(id, label);
    }
  };

  return (
    <div className={`${styles.customNode} ${selected ? styles.selected : ''}`} onDoubleClick={handleDoubleClick}>
      <Handle type="target" position={Position.Top} />
      <div>
        {isEditing ? (
          <input
            value={label}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className={styles.input}
          />
        ) : (
          <div className={styles.label}>{label}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default CustomNode;
