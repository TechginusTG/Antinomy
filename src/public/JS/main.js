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

    // 페이지 로드 시 목표 요약 초기화
    updateGoalSummary();
});

// 소켓 연결
const socket = io();

// GPT 답변 수신 시 채팅창에 추가
socket.on("gpt response", (gptMsg) => {
    addGptMessage(gptMsg);
});

// GPT 답변을 채팅창에 추가하는 함수
function addGptMessage(msg) {
    const chatLog = document.getElementById('chatLog');
    if (!chatLog) return;
    const li = document.createElement('li');
    li.className = "bubble ai";
    li.textContent = msg;
    chatLog.appendChild(li);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// 기존 sendChatMessage 함수에서 메시지 전송


function addUserMessage(msg) {
    const chatLog = document.getElementById('chatLog');
    if (!chatLog) return;
    const li = document.createElement('li');
    li.className = "bubble user";
    li.textContent = msg;
    chatLog.appendChild(li);
    chatLog.scrollTop = chatLog.scrollHeight;
}
