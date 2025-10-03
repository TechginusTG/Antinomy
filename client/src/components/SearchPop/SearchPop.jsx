import React from 'react';
import { FaSearch } from 'react-icons/fa';
import styles from './SearchPop.module.css';

const SearchPop = ({
  word,
  keyword,
  isActive,
  onHighlight,
  onUnhighlight,
  onAfterSearch,
  fontSize,
}) => {
  if (!word || !keyword) {
    return null;
  }

  const trimmedKeyword = (keyword || '').trim();
  if (!trimmedKeyword) {
    return null;
  }

  const iconStyle = fontSize ? { fontSize } : undefined;
  const buttonClass = `${styles.searchWordButton} ${isActive ? styles.highlightedWord : ''}`;
  const iconClass = `${styles.searchIcon} ${isActive ? styles.searchIconVisible : ''}`;
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(trimmedKeyword)}`;

  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClass}
      onMouseEnter={onHighlight}
      onFocus={onHighlight}
      onMouseLeave={onUnhighlight}
      onBlur={onUnhighlight}
      onClick={(event) => {
        event.stopPropagation();
        if (onAfterSearch) {
          onAfterSearch();
        }
      }}
      aria-label={`${trimmedKeyword} 검색`}
    >
      <span className={styles.wordText}>{word}</span>
      <FaSearch className={iconClass} style={iconStyle} aria-hidden="true" />
    </a>
  );
};

export default SearchPop;
