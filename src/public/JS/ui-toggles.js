export function toggleChat() {
    const chat = document.getElementById('chat');
    const chatInputArea = document.getElementById('chatInputArea');
    const openBtn = document.getElementById('openChatButton');
    const diagram = document.getElementById('diagram');
    const lastResponseElement = document.getElementById('lastResponse');

    const isCollapsed = chat.classList.toggle('collapsed');
    chatInputArea.classList.toggle('collapsed');

    openBtn.style.display = isCollapsed ? 'block' : 'none';
    diagram.style.flexGrow = isCollapsed ? 2 : 1;

    if (isCollapsed) {
        // ✅ 채팅 닫힘: 기존 팝업 제거
        const existingPopup = document.getElementById('gptResponsePopup');
        if (existingPopup) {
            existingPopup.remove();
        }
    } else {
        // ✅ 채팅 열림: 팝업 새로 생성
        const newPopup = document.createElement('div');
        newPopup.id = 'gptResponsePopup';
        newPopup.className = 'popup';
        Object.assign(newPopup.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            padding: '20px',
            zIndex: '9999',
            display: 'block',
        });

        const content = document.createElement('div');
        content.id = 'popupResponseContent';

        if (lastResponseElement) {
            const cleanedText = lastResponseElement.textContent
                .replace('ChatGPT:', '')
                .trim()
                .replace(/\n{2,}/g, '\n')
                .replace(/\t/g, ' ');
            content.textContent = cleanedText;
        } else {
            content.textContent = '마지막 ChatGPT 답변이 없습니다.';
        }

        newPopup.appendChild(content);

        // 버튼 생성
        const minimizeBtn = document.createElement('button');
        minimizeBtn.id = 'popupMinimizeBtn';
        minimizeBtn.textContent = '<';
        minimizeBtn.title = '축소';
        Object.assign(minimizeBtn.style, {
            position: 'absolute',
            right: '10px',
            top: '10px',
        });

        minimizeBtn.addEventListener('click', () => togglePopup(newPopup, minimizeBtn));
        newPopup.appendChild(minimizeBtn);

        document.body.appendChild(newPopup);
    }
}