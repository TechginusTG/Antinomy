// main.js

import { autoResizeTextarea, sendChatMessage } from './chat-management.js';
import { toggleGoalModal, toggleChat } from './ui-toggles.js';
import { updateGoalSummary, exportToXML } from './goal-summary.js';
import './popup-drag.js'; // 팝업 드래그 기능은 자체적으로 이벤트 리스너를 설정하므로 임포트만

document.addEventListener('DOMContentLoaded', () => {
    // 채팅 관련 이벤트 리스너
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    if (userInput) {
        userInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendChatMessage();
                this.style.height = '40px';
            }
        });
        userInput.addEventListener('input', autoResizeTextarea);
    }
    if (sendBtn) {
        sendBtn.addEventListener('click', sendChatMessage);
    }

    // 목표 모달 버튼 이벤트 리스너 (HTML에 해당 버튼이 있다고 가정)
    const toggleGoalModalBtn = document.getElementById('toggleGoalModalBtn'); // 가정: 목표 모달을 여는 버튼 ID
    if (toggleGoalModalBtn) {
        toggleGoalModalBtn.addEventListener('click', toggleGoalModal);
    }

    // 채팅 토글 버튼 이벤트 리스너 (HTML에 해당 버튼이 있다고 가정)
    const toggleChatBtn = document.getElementById('toggleChatBtn'); // 가정: 채팅을 토글하는 버튼 ID
    if (toggleChatBtn) {
        toggleChatBtn.addEventListener('click', toggleChat);
    }

    // XML 내보내기 버튼 이벤트 리스너 (HTML에 해당 버튼이 있다고 가정)
    const exportXmlBtn = document.getElementById('exportXmlBtn'); // 가정: XML 내보내기 버튼 ID
    if (exportXmlBtn) {
        exportXmlBtn.addEventListener('click', exportToXML);
    }

    // 페이지 로드 시 목표 요약 초기화
    updateGoalSummary();
});