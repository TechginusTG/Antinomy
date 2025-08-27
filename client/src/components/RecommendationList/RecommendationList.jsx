import React from 'react';
import { Button } from 'antd';
import styles from './RecommendationList.module.css';

const RecommendationList = ({ recommendations, onRecommendationClick, onClearRecommendations }) => {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={styles.recommendationContainer}>
      <div className={styles.recommendationHeader}>
        <span>추천 질문:</span>
        <Button type="text" size="small" onClick={onClearRecommendations}>지우기</Button>
      </div>
      <ul className={styles.recommendationList}>
        {recommendations.map((rec, index) => (
          <li key={index}>
            <Button type="link" onClick={() => onRecommendationClick(rec)}>
              {rec}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendationList;
