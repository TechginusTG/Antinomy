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
    const chatInputArea = document.getElementById('chatInputArea');
    const openBtn = document.getElementById('openChatButton');
    const diagram = document.getElementById('diagram');
    const lastResponseElement = document.getElementById('lastResponse');
    const popupResponseContent = document.getElementById('popupResponseContent');
    const gptResponsePopup = document.getElementById('gptResponsePopup');
    const minimizeBtn = document.getElementById('popupMinimizeBtn');

    const isCollapsed = chat.classList.toggle('collapsed');
    chatInputArea.classList.toggle('collapsed');

    openBtn.style.display = isCollapsed ? 'block' : 'none';
    if (!isCollapsed) {
        if (gptResponsePopup) gptResponsePopup.style.display = 'none';
        if (minimizeBtn) minimizeBtn.style.display = 'none';
    }
    diagram.style.flexGrow = isCollapsed ? 2 : 1;
	

}
