import React, { useState } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import styles from './Bubble.module.css';
import useFlowStore from '../../utils/flowStore';

const Bubble = ({
    id, 
    className, 
    children,
    isUser,
    onDelete,
    onEdit,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const chatFontSize = useFlowStore((state) => state.chatFontSize);

    return (
        <li
            className={`${className} ${isUser ? styles.userBubbleContainer : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ fontSize: `${chatFontSize}px` }}
        >
            {children}
            {isUser && isHovered && (
                <div className={styles.bubbleActions}>
                    <button 
                        onClick={() => onEdit(id)} 
                        className={styles.bubbleActionBtn}
                    >
                        <FiEdit />
                    </button>
                    <button onClick={() => onDelete(id)} className={styles.bubbleActionBtn}>
                        <FiTrash2 />
                    </button>
                </div>
            )}
        </li>
    );
};

export default Bubble;
