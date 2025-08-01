// ui-toggles.js

// 목표 모달 표시/숨김

const goalModal = document.getElementById('goalModal'); //사용할 컴포넌트 임포트
const chat = document.getElementById('chat');
const chatInputArea = document.getElementById('chatInputArea');
const openBtn = document.getElementById('openChatButton');
const diagram = document.getElementById('diagram');
const lastResponseElement = document.getElementById('lastResponse');
const popupResponseContent = document.getElementById('popupResponseContent');
const gptResponsePopup = document.getElementById('gptResponsePopup');
const minimizeBtn = document.getElementById('popupMinimizeBtn');

export function toggleGoalModal() {
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
    

    const isCollapsed = chat.classList.toggle('collapsed');
    chatInputArea.classList.toggle('collapsed');

    openBtn.style.display = isCollapsed ? 'block' : 'none';
    if (!isCollapsed) {
        if (gptResponsePopup) gptResponsePopup.style.display = 'none';
    }else{
	if(gptResponsePopup) gptResponsePopup.style.display = 'block';
    }
    diagram.style.flexGrow = isCollapsed ? 2 : 1;

}

export function togglePopup(){
    gptResponsePopup.style.display = 'none';
}

minimizeBtn.addEventListener('click', togglePopup);
