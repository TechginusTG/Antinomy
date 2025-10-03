import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiThumbsUp } from 'react-icons/fi';
import { AiFillLike } from 'react-icons/ai';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import SearchPop from '../SearchPop/SearchPop';
import { useSearchPop } from '../SearchPop/useSearchPop';
import styles from './Bubble.module.css';

const Bubble = ({
    id,
    className,
    content,
    sender,
    isLoading,
    onDelete,
    onEdit,
    onLike,
    isLiked,
    chatWidth,
    isMobile,
    chatFontSize,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const { popover, showPopover, hidePopover } = useSearchPop();

    const isUser = sender === 'user';

    let finalFontSize;

    if (isMobile) {
        finalFontSize = `${chatFontSize}px`;
    } else {
        const baseFontSize = 0.625;
        const maxFontSize = 1;
        const minChatWidth = 20;
        const maxChatWidth = 50;

        let dynamicFontSize = baseFontSize;
        if (chatWidth) {
            const widthRange = maxChatWidth - minChatWidth;
            const fontRange = maxFontSize - baseFontSize;
            dynamicFontSize = baseFontSize + ((chatWidth - minChatWidth) / widthRange) * fontRange;
            dynamicFontSize = Math.max(baseFontSize, Math.min(dynamicFontSize, maxFontSize));
        }
        finalFontSize = `${dynamicFontSize}rem`;
    }

    const renderAiContent = (text) => {
        let wordCounter = 0;
        const renderParagraph = ({ children }) => {
            const processChildren = (nodes) => {
                return React.Children.map(nodes, (child) => {
                    if (typeof child === 'string') {
                        return child.split(/(\s+)/).map((word) => {
                            const cleanedWord = word.replace(/[.,\/#!$%^&*;:{}=\-_`~()]/g, '').trim();
                            if (cleanedWord.length > 1) {
                                const wordId = `word-${id}-${wordCounter++}`;
                                const isActive = popover.visible && popover.hoveredWordId === wordId;
                                return (
                                    <SearchPop
                                        key={wordId}
                                        word={word}
                                        keyword={cleanedWord}
                                        isActive={isActive}
                                        onHighlight={() => showPopover(cleanedWord, wordId)}
                                        onUnhighlight={hidePopover}
                                        onAfterSearch={hidePopover}
                                        fontSize={finalFontSize}
                                    />
                                );
                            }
                            return word;
                        });
                    }
                    if (child && child.props && child.props.children) {
                        return React.cloneElement(child, { ...child.props, children: processChildren(child.props.children) });
                    }
                    return child;
                });
            };
            return <p>{processChildren(children)}</p>;
        };

        return (
            <div className={styles.markdownContent}>
                <ReactMarkdown components={{ p: renderParagraph }}>
                    {text.replace(/KEYWORDS:.*/s, "").trim()}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <li
            className={`${className} ${isUser ? styles.userBubbleContainer : styles.aiBubbleContainer}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                hidePopover();
            }}
            style={{ fontSize: finalFontSize }}
        >
            {isLoading ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "reverse",
                    }}
                >
                    AI가 생각중이에요...
                </motion.div>
            ) : isUser ? (
                content
            ) : (
                renderAiContent(content)
            )}

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
            {!isUser && isHovered && (
                <div className={styles.bubbleActions}>
                    <button
                        onClick={() => onLike(id)}
                        className={styles.bubbleActionBtn}
                        disabled={isLiked}
                    >
                        {isLiked ? <AiFillLike /> : <FiThumbsUp />}
                    </button>
                </div>
            )}
        </li>
    );
};

export default Bubble;
