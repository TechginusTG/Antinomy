import React, { useState, useEffect } from 'react';
import styles from './DiagramMessage.module.css';
import { quotes } from '../../utils/quotes/quotes.js';

const DiagramMessage = ({ message }) => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    if (message) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setQuote(quotes[randomIndex]);
    }
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div>
        <div className={`${styles.message} ${styles.blinkingText}`}>{message}</div>
        {quote && <div className={styles.quoteText}>{quote}</div>}
      </div>
    </div>
  );
};

export default DiagramMessage;
