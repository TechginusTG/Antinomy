import React, { useState, useEffect } from 'react';
import styles from './GuideModal.module.css';

import img1 from '../../assets/img/TutoImg/1.png';
import img2 from '../../assets/img/TutoImg/2.png'; 
import img3 from '../../assets/img/TutoImg/3.png'; 
import img4 from '../../assets/img/TutoImg/4.png'; 
import img5 from '../../assets/img/TutoImg/5.png';
import img6 from '../../assets/img/TutoImg/6.png';

const guidePages = [
  {
    title: '1단계: 환영합니다!',
    content: 'Antinomy는 AI와 대화하며 생각을 다이어그램으로 정리하고, 실행까지 돕는 도구입니다. 핵심 사용법을 알려드릴게요.',
    image: null,
  },
  {
    title: '2단계: 대화방 관리하기',
    content: '새로운 대화방을 만들고, 주제별로 생각을 분리하여 관리할 수 있습니다. 좌측 상단의 메뉴를 열어 대화방을 관리해보세요.',
    image: img1,
  },
  {
    title: '3단계: 다이어그램 생성하기',
    content: 'AI와 대화가 충분히 진행되었다면 \'Make Diagram\' 버튼을 눌러보세요. 대화의 흐름을 한눈에 파악할 수 있는 다이어그램이 생성됩니다.',
    image: img2,
  },
  {
    title: '4단계: 퀘스트로 실행하기',
    content: '다이어그램이 생성되면, AI가 목표 달성을 위한 구체적인 \'퀘스트\'를 제안합니다. 우측 상단의 전구 아이콘(💡)을 눌러 퀘스트를 확인하고 완료하며 경험치를 얻어보세요.',
    image: img3, 
  },
  {
    title: '5단계: 중요 대화 표시하기',
    content: '대화 내용 중 중요하거나 다시 보고 싶은 부분에는 \'좋아요(❤️)\'를 눌러 표시할 수 있습니다. \'좋아요\'한 대화는 프로필 창에서 모아볼 수 있습니다.',
    image: img5, 
  },
  {
    title: '6단계: 나만의 스타일로 꾸미기',
    content: '우측 상단의 설정 아이콘(⚙️)에서 채팅창 크기나 앱의 전체적인 테마를 변경하여 자신만의 작업 환경을 만들 수 있습니다.',
    image: img4, 
  },
  {
    title: '7단계: 작업 내용 저장하기',
    content: '현재까지의 모든 대화와 다이어그램 내용을 하나의 파일로 저장(Export)하거나, 이전에 저장한 파일을 불러올(Import) 수 있습니다.',
    image: img6, 
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