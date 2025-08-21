import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import styles from './Bubble.module.css';

const Bubble = ({
    id, 
    className, 
    children,
    isUser,
    onDelete,
    onEdit,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(children);

    const handleEdit = () => {
        onEdit(id, editText);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditText(children);
    };

    return (
        <li
            className={`${className} ${isUser ? styles.userBubbleContainer : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {isEditing ? (
                <div className={styles.bubbleEditContainer}>
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className={styles.bubbleEditTextarea}
                        autoFocus
                    />
                    <div className={styles.bubbleEditActions}>
                        <button onClick={handleEdit} className={styles.bubbleActionBtn}>
                            <FiCheck />
                        </button>
                        <button onClick={handleCancel} className={styles.bubbleActionBtn}>
                            <FiX />
                        </button>
                    </div>
                </div>
            ) : (
                <>
                {children}
                {isUser && isHovered && (
                    <div className={styles.bubbleActions}>
                        <button 
                            onClick={() => setIsEditing(true)} 
                            className={styles.bubbleActionBtn}
                        >
                            <FiEdit />
                        </button>
                        <button onClick={() => onDelete(id)} className={styles.bubbleActionBtn}>
                            <FiTrash2 />
                        </button>
                    </div>
                )}
                </>
            )}
        </li>
    );
};

export default Bubble;