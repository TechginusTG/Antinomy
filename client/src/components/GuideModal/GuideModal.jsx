import React, { useState, useRef, useEffect } from 'react';
import { Modal, Steps, Carousel, Button } from 'antd';
import styles from './GuideModal.module.css';

import img1 from '../../assets/img/TutoImg/1.png';
import img2 from '../../assets/img/TutoImg/2.png'; 
import img3 from '../../assets/img/TutoImg/3.png'; 
import img4 from '../../assets/img/TutoImg/4.png'; 
import img5 from '../../assets/img/TutoImg/5.png';
import img6 from '../../assets/img/TutoImg/6.png';
const guidePages = [
  {
    title: '환영합니다!',
    smallTitle: '시작',
    content: 'Antinomy는 AI와 대화하며 생각을 다이어그램으로 정리하고, 실행까지 돕는 도구입니다. 핵심 사용법을 알려드릴게요.',
    image: null,
  },
  {
    title: '대화방 관리',
    smallTitle: '대화방',
    content: '새로운 대화방을 만들고, 주제별로 생각을 분리하여 관리할 수 있습니다. 좌측 상단의 메뉴를 열어 대화방을 관리해보세요.',
    image: img1,
  },
  {
    title: '다이어그램 생성',
    smallTitle: '도표화',
    content: 'AI와 대화가 충분히 진행되었다면 \'Make Diagram\' 버튼을 눌러보세요. 대화의 흐름을 한눈에 파악할 수 있는 다이어그램이 생성됩니다.',
    image: img2,
  },
  {
    title: '퀘스트 실행',
    smallTitle: '퀘스트',
    content: '다이어그램이 생성되면, AI가 목표 달성을 위한 구체적인 \'퀘스트\'를 제안합니다. 우측 상단의 전구 아이콘(💡)을 눌러 퀘스트를 확인하고 완료하며 경험치를 얻어보세요.',
    image: img3,
  },
  {
    title: '중요 대화 표시',
    smallTitle: '좋아요',
    content: '대화 내용 중 중요하거나 다시 보고 싶은 부분에는 \'좋아요\'를 눌러 표시할 수 있습니다. \'좋아요\'한 대화는 프로필 창에서 모아볼 수 있습니다.',
    image: img5,
  },
  {
    title: '스타일 꾸미기',
    smallTitle: '꾸미기',
    content: '우측 상단의 설정 아이콘(⚙️)에서 채팅창 크기나 앱의 전체적인 테마를 변경하여 자신만의 작업 환경을 만들 수 있습니다.',
    image: img4,
  },
  {
    title: '저장하고 불러오기',
    smallTitle: '저장',
    content: '현재까지의 모든 대화와 다이어그램 내용을 하나의 파일로 저장(Export)하거나, 이전에 저장한 파일을 불러올(Import) 수 있습니다.',
    image: img6,
  },
];

const GuideModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCurrentStep(0);
        if (carouselRef.current) {
          carouselRef.current.goTo(0, true);
        }
      }, 300);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };

  const handlePrev = () => {
    if (carouselRef.current) {
      carouselRef.current.prev();
    }
  };

  const afterChange = (current) => {
    setCurrentStep(current);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title="Antinomy 사용 가이드"
      width={720}
      footer={(<div className={styles.footer}>
          <div className={styles.footerLeft}>
            {currentStep + 1} / {guidePages.length}
          </div>
          <div className={styles.footerRight}>
            {currentStep > 0 && (
              <Button className={styles.prevButton} onClick={handlePrev}>
                이전
              </Button>
            )}
            {currentStep < guidePages.length - 1 ? (
              <Button type="primary" onClick={handleNext}>
                다음
              </Button>
            ) : (
              <Button type="primary" onClick={onClose}>
                시작하기
              </Button>
            )}
          </div>
        </div>)}
    >
      <Steps current={currentStep} size="small" className={styles.steps}>
        {guidePages.map((page, index) => (
          <Steps.Step key={page.title} title={page.smallTitle} />
        ))}
      </Steps>

      <Carousel ref={carouselRef} afterChange={afterChange} dots={false} effect="fade">
        {guidePages.map(page => (
          <div key={page.title} className={styles.carouselContent}>
            <h3>{page.title}</h3>
            <div className={styles.contentBody}>
              {page.image && <img src={page.image} alt={page.title} className={styles.guideImage} />}
              <p className={styles.contentText}>{page.content}</p>
            </div>
          </div>
        ))}
      </Carousel>
    </Modal>
  );
};

export default GuideModal;
