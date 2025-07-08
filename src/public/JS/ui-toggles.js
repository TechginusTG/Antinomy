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

// 채팅 창 표시/숨김
export function toggleChat() {
    const chat = document.getElementById('chat');
    const openBtn = document.getElementById('openChatButton');
    const diagram = document.getElementById('diagram');
    const isCollapsed = chat.classList.toggle('collapsed');
    openBtn.style.display = isCollapsed ? 'block' : 'none';
    diagram.style.flexGrow = isCollapsed ? 2 : 1;

    // 채팅창이 거대화(펼쳐질 때) 팝업/버튼 상태 초기화
    if (!isCollapsed) {
        const popup = document.getElementById('gptResponsePopup');
        const minimizeBtn = document.getElementById('popupMinimizeBtn');
        if (popup && minimizeBtn) {
            popup.classList.remove('popup-minimized');
            popup.style.width = '';
            popup.style.height = '';
            popup.style.top = '50%';
            popup.style.left = '50%';
            popup.style.transform = 'translate(-50%, -50%)';
            minimizeBtn.textContent = '축소';
            minimizeBtn.style.position = 'absolute';
            minimizeBtn.style.right = '10px';
            minimizeBtn.style.top = '10px';
            minimizeBtn.style.left = '';
            minimizeBtn.style.transform = '';
            minimizeBtn.style.display = 'block';
        }
    }
}

// 팝업 최소화/복원 함수
// (채팅창 거대화와 팝업 최소화 연동 기능 제거, 팝업 자체 토글만 남김)
export function togglePopup() {
    const popup = document.getElementById('gptResponsePopup');
    const minimizeBtn = document.getElementById('popupMinimizeBtn');
    if (!popup || !minimizeBtn) return;

    // 버튼을 팝업 내부 오른쪽 상단에 고정
    minimizeBtn.style.position = 'absolute';
    minimizeBtn.style.right = '10px';
    minimizeBtn.style.top = '10px';
    minimizeBtn.style.left = '';
    minimizeBtn.style.transform = '';
    minimizeBtn.style.display = 'block';

    const isMinimized = popup.classList.toggle('popup-minimized');
    if (isMinimized) {
        minimizeBtn.textContent = '복원';
        // 팝업을 축소 스타일로
        popup.style.width = '120px';
        popup.style.height = '60px';
    } else {
        minimizeBtn.textContent = '축소';
        // 팝업을 원래 크기로
        popup.style.width = '';
        popup.style.height = '';
    }
}
