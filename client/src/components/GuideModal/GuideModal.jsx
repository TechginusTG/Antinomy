import React, { useState, useEffect } from 'react';
import styles from './GuideModal.module.css';

const guidePages = [
  {
    title: '환영합니다!',
    content: 'Antinomy는 AI와 대화하며 생각을 다이어그램으로 정리하는 도구입니다. 기본적인 사용법을 알려드릴게요.',
  },
  {
    title: '다이어그램 생성',
    content: '왼쪽 채팅창에서 AI와 자유롭게 대화하세요. 대화가 어느 정도 진행되면 하단의 \'다이어그램 생성\' 버튼을 눌러보세요. AI가 대화 내용을 바탕으로 핵심 노드를 생성해 줄 거예요.',
  },
  {
    title: '퀘스트와 상호작용',
    content: '생성된 다이어그램을 기반으로 AI가 퀘스트를 제안할 수 있습니다. 우측 상단의 전구 아이콘을 눌러 퀘스트를 확인하고 생각을 더 발전시켜 보세요. 즐거운 여정이 되길 바랍니다!',
  },
];

const GuideModal = ({ isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCurrentPage(0);
      }, 200);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleNext = () => {
    if (currentPage < guidePages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const isLastPage = currentPage === guidePages.length - 1;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>{guidePages[currentPage].title}</h2>
        <p>{guidePages[currentPage].content}</p>
        
        <div className={styles.footer}>
            <span className={styles.pageIndicator}>
                {currentPage + 1} / {guidePages.length}
            </span>
            <div className={styles.buttonGroup}>
                {currentPage > 0 && (
                    <button onClick={handlePrev} className={styles.navButton}>
                        이전
                    </button>
                )}
                {isLastPage ? (
                    <button onClick={onClose} className={styles.closeButton}>
                        닫기
                    </button>
                ) : (
                    <button onClick={handleNext} className={styles.navButton}>
                        다음
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;