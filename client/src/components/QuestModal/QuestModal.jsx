import React from 'react';
import { Modal, Checkbox } from 'antd';
import useFlowStore from '../../utils/flowStore';

const QuestModal = ({ quests, completedQuests, handleQuestChange }) => {
  const { isQuestOpen, setIsQuestOpen } = useFlowStore();

  return (
    <Modal
      title="Quest"
      open={isQuestOpen}
      onCancel={() => setIsQuestOpen(false)}
      onOk={() => setIsQuestOpen(false)}
    >
      <div>
        {quests.length > 0 ? (
          <ul>
            {quests.map((quest, index) => (
              <li key={index}>
                <Checkbox
                  checked={completedQuests.includes(index)}
                  onChange={(e) => handleQuestChange(index, e.target.checked)}
                />
                <span style={{ marginLeft: 8 }}>{quest}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>아직 퀘스트가 생성되지 않았습니다. </p>
        )}
      </div>
    </Modal>
  );
};

export default QuestModal;
