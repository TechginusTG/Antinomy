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
}

// 팝업 최소화/복원 함수
export function togglePopup() {
    const popup = document.getElementById('gptResponsePopup');
    const minimizeBtn = document.getElementById('popupMinimizeBtn');
    if (!popup || !minimizeBtn) return;

    const isMinimized = popup.classList.toggle('popup-minimized');
    if (isMinimized) {
        // 축소 상태: > 버튼
        minimizeBtn.textContent = '>';
        minimizeBtn.title = '복원';
        minimizeBtn.style.position = 'fixed';
        minimizeBtn.style.left = '0';
        minimizeBtn.style.top = '50%';
        minimizeBtn.style.transform = 'translateY(-50%)';
        minimizeBtn.style.display = 'block';
        popup.style.display = 'block';
    } else {
        // 거대화(복원) 상태: < 버튼
        minimizeBtn.textContent = '<';
        minimizeBtn.title = '축소';
        minimizeBtn.style.position = 'absolute';
        minimizeBtn.style.right = '10px';
        minimizeBtn.style.top = '10px';
        minimizeBtn.style.left = '';
        minimizeBtn.style.transform = '';
        minimizeBtn.style.display = 'block';
        popup.style.display = 'block';
        popup.style.top = '50%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
    }
}
