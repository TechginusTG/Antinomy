// src/public/JS/main.js (수정된 코드)

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

    // 목표 모달 버튼 이벤트 리스너 (HTML의 'goalBox' ID 사용)
    const goalBox = document.getElementById('goalBox'); // HTML의 <div id="goalBox">와 일치
    if (goalBox) {
        goalBox.addEventListener('click', toggleGoalModal);
    }

    // 채팅 토글 버튼 이벤트 리스너 (HTML의 'toggleChat' 및 'openChatButton' ID 사용)
    const toggleChatBtn1 = document.getElementById('toggleChat'); // HTML의 <button id="toggleChat">와 일치
    const toggleChatBtn2 = document.getElementById('openChatButton'); // HTML의 <button id="openChatButton">와 일치

    if (toggleChatBtn1) {
        toggleChatBtn1.addEventListener('click', toggleChat);
    }
    if (toggleChatBtn2) {
        toggleChatBtn2.addEventListener('click', toggleChat);
    }

    // XML 내보내기 버튼 이벤트 리스너 (HTML의 'exportBtn' ID 사용)
    const exportXmlBtn = document.getElementById('exportBtn'); // HTML의 <button id="exportBtn">와 일치
    if (exportXmlBtn) {
        exportXmlBtn.addEventListener('click', exportToXML);
    }

    // 초기화 버튼 이벤트 리스너
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm("정말 모든 대화 기록을 초기화하시겠습니까?")) {
                localStorage.clear();
                // 채팅창도 비우기
                const chatLog = document.getElementById('chatLog');
                if (chatLog) chatLog.innerHTML = "";
                alert("초기화가 완료되었습니다.");
            }
        });
    }

    // 페이지 로드 시 목표 요약 초기화
    updateGoalSummary();
});