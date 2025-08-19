import React, { useState, useEffect } from 'react';
import styles from './GuideModal.module.css';

import img1 from '../../assets/img/AntinomyTuto_1.png';
import img2 from '../../assets/img/AntinomyTuto_2.png'; 
import img3 from '../../assets/img/AntinomyTuto_3.png'; 
import img4 from '../../assets/img/AntinomyTuto_4.png'; 

const guidePages = [
  {
    title: '환영합니다!',
    content: 'Antinomy는 AI와 대화하며 생각을 다이어그램으로 정리하는 도구입니다. 기본적인 사용법을 알려드릴게요.',
    image: null, 
  },
  {
    title: '1. Antinomy와 대화하기',
    content: '왼쪽 채팅창에서 AI와 자유롭게 대화하세요. Antinomy는 당신의 문제 해결 도우미입니다. ',
    image: img1,
  },
  {
    title: '2. 다이어그램 생성',
    content: '대화가 어느 정도 진행되면, 하단의 \'Make Diagram\' 버튼을 눌러보세요. Antinomy가 대화 내용을 바탕으로 오른쪽에 다이어그램을 생성해 줍니다. ',
    image: img2,
  },
  {
    title: '3. 퀘스트와 상호작용',
    content: '생성된 다이어그램을 기반으로 Antinomy가 간단한 퀘스트를 제안할 수 있습니다. 우측 상단의 전구 아이콘을 눌러 퀘스트를 확인하고 생각을 더 발전시켜 보세요. 퀘스트를 완료하면 경험치를 획득할 수 있습니다. ',
    image: img3, 
  },
  {
    title: '4. 설정',
    content: '우측 상단의 \'설정\' 아이콘을 눌러, 테마를 변경할 수 있습니다. 경험치를 얻어 레벨을 올리면 더 많은 테마가 잠금 해제됩니다. 또한 왼쪽 채팅창의 너비도 조절할 수 있어요.',
    image: img4, 
  }
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
  const currentPageData = guidePages[currentPage];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>{currentPageData.title}</h2>
        
        {currentPageData.image && (
            <img 
                src={currentPageData.image} 
                alt={currentPageData.title} 
                className={styles.guideImage} 
            />
        )}

        <p>{currentPageData.content}</p>
        
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
