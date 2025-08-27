import React from 'react';
import { Modal, Checkbox, Button, Divider } from 'antd';
import useFlowStore from '../../utils/flowStore';

const QuestModal = ({ 
  quests, 
  completedQuests, 
  handleQuestChange, 
  onRecommendationClick 
}) => {
  const { 
    isQuestOpen, 
    setIsQuestOpen, 
    recommendations, 
    clearRecommendations 
  } = useFlowStore();

  const handleRecommendationClick = (rec) => {
    onRecommendationClick(rec);
    setIsQuestOpen(false); 
  };

  return (
    <Modal
      title="퀘스트 및 추천 질문"
      open={isQuestOpen}
      onCancel={() => setIsQuestOpen(false)}
      footer={[
        <Button key="clear" onClick={clearRecommendations}>
          추천 질문 지우기
        </Button>,
        <Button key="ok" type="primary" onClick={() => setIsQuestOpen(false)}>
          확인
        </Button>,
      ]}
    >
      <div>
        <h3>퀘스트</h3>
        {quests.length > 0 ? (
          <ul>
            {quests.map((quest, index) => (
              <li key={index}>
                <Checkbox
                  checked={completedQuests.includes(index)}
                  onChange={(e) => handleQuestChange(index, e.target.checked)}
                />
                <span style={{
                  marginLeft: 8,
                  textDecoration: completedQuests.includes(index) ? 'line-through' : 'none',
                  color: completedQuests.includes(index) ? '#888' : 'inherit'
                }}>
                  {quest}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>아직 퀘스트가 생성되지 않았습니다.</p>
        )}
      </div>

      {recommendations.length > 0 && (
        <div>
          <Divider />
          <h3>추천 질문</h3>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index} style={{ marginTop: 8 }}>
                <Button type="link" onClick={() => handleRecommendationClick(rec)}>
                  {rec}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
};

export default QuestModal;
