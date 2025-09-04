import React, { useState } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import styles from './Bubble.module.css';

const Bubble = ({
    id,
    className,
    children,
    isUser,
    onDelete,
    onEdit,
    chatWidth,
    isMobile,
    chatFontSize,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    let finalFontSize;

    if (isMobile) {
        finalFontSize = `${chatFontSize}px`;
    } else {
        // Font size in rem
        const baseFontSize = 0.625; // 10px
        const maxFontSize = 1; // 16px
        const minChatWidth = 20; // min chat width in %
        const maxChatWidth = 50; // max chat width in %

        let dynamicFontSize = baseFontSize;
        if (chatWidth) {
            const widthRange = maxChatWidth - minChatWidth;
            const fontRange = maxFontSize - baseFontSize;
            dynamicFontSize = baseFontSize + ((chatWidth - minChatWidth) / widthRange) * fontRange;
            dynamicFontSize = Math.max(baseFontSize, Math.min(dynamicFontSize, maxFontSize));
        }
        finalFontSize = `${dynamicFontSize}rem`;
    }

    return (
        <li
            className={`${className} ${isUser ? styles.userBubbleContainer : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ fontSize: finalFontSize }}
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
