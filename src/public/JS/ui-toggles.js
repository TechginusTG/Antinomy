// ui-toggles.js

// 목표 모달 표시/숨김
export function toggleGoalModal() {
    const goalModal = document.getElementById('goalModal');
    goalModal.style.display = goalModal.style.display === 'block' ? 'none' : 'block';
    if (goalModal.style.display === 'block') {
        // 목표 요약 업데이트 (goal-summary.js에서 import 해야 함)
        import('./goal-summary.js').then(({ updateGoalSummary }) => {
            updateGoalSummary();
        });
    }
}

// 채팅 창 표시/숨김 및 팝업 동기화
export function toggleChat() {
    const chat = document.getElementById('chat');
    const chatInputArea = document.getElementById('chatInputArea').classList.toggle('collapsed'); // 'collapsed' 클래스 토글
    const openBtn = document.getElementById('openChatButton');
    const diagram = document.getElementById('diagram');
    const lastResponseElement = document.getElementById('lastResponse');
    const popupResponseContent = document.getElementById('popupResponseContent');
    const gptResponsePopup = document.getElementById('gptResponsePopup');

    const isCollapsed = chat.classList.toggle('collapsed'); // 'collapsed' 클래스 토글

    openBtn.style.display = isCollapsed ? 'block' : 'none'; // 버튼 표시/숨김
    const minimizeBtn = document.getElementById('popupMinimizeBtn');
    const restoreBtn = document.getElementById('popupRestoreBtn');
    // 채팅창 열릴 때 팝업/버튼 복원 상태로 강제
    if (!isCollapsed) {
        if (gptResponsePopup) {
            gptResponsePopup.classList.remove('popup-minimized');
            gptResponsePopup.style.display = 'block';
        }
        if (minimizeBtn) {
            minimizeBtn.style.display = 'block';
            minimizeBtn.style.position = 'absolute';
            minimizeBtn.style.right = '10px';
            minimizeBtn.style.top = '10px';
        }
        if (restoreBtn) {
            restoreBtn.style.display = 'none';
            restoreBtn.style.position = 'fixed';
            restoreBtn.style.left = '0';
            restoreBtn.style.top = '50%';
            restoreBtn.style.transform = 'translateY(-50%)';
        }
        window.isPopupMinimized = false;
    } else {
        // 채팅창 닫힐 때 팝업/버튼 축소 상태로 강제
        if (gptResponsePopup) {
            gptResponsePopup.classList.add('popup-minimized');
            gptResponsePopup.style.display = 'none';
        }
        if (minimizeBtn) minimizeBtn.style.display = 'none';
        if (restoreBtn) restoreBtn.style.display = 'block';
        window.isPopupMinimized = true;
    }
    diagram.style.flexGrow = isCollapsed ? 2 : 1; // 다이어그램 영역 크기 조절

    if (isCollapsed) { // 채팅이 접힐 때
        if (lastResponseElement) {
            const lastGptText = lastResponseElement.textContent.replace('ChatGPT:', '').trim();
            const cleanedGptText = lastGptText.trim().replace(/\n{2,}/g, '\n').replace(/\t/g, ' '); // 텍스트 정리
            
            if (popupResponseContent && gptResponsePopup) {
                popupResponseContent.textContent = cleanedGptText;
                gptResponsePopup.style.display = 'block'; // 팝업 표시
                // 팝업 중앙 정렬 (초기 위치)
                gptResponsePopup.style.top = '50%';
                gptResponsePopup.style.left = '50%';
                gptResponsePopup.style.transform = 'translate(-50%, -50%)';
            }
        } else {
            if (popupResponseContent && gptResponsePopup) {
                popupResponseContent.textContent = "마지막 ChatGPT 답변이 없습니다.";
                gptResponsePopup.style.display = 'block';
            }
        }
    } else { // 채팅이 펼쳐질 때
        if (gptResponsePopup) {
            gptResponsePopup.style.display = 'none'; // 팝업 숨김
        }
    }
}
