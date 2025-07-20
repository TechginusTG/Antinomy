// public/JS/draw.js

document.addEventListener('DOMContentLoaded', () => {
    // Mermaid.js 초기화
    mermaid.initialize({ startOnLoad: true });

    // 기본 순서도 내용
    const defaultFlowchart = `
graph TD
    A[시작] --> B{결정};
    B -- 예 --> C[처리 1];
    B -- 아니오 --> D[처리 2];
    C --> E[종료];
    D --> E[종료];
`;

    const diagramContainer = document.getElementById('diagramContent');
    if (diagramContainer) {
        diagramContainer.innerHTML = defaultFlowchart;
        // Mermaid가 렌더링할 수 있도록 클래스 추가
        diagramContainer.classList.add('mermaid');
        // 동적 렌더링을 위해 API 호출
        mermaid.init(undefined, diagramContainer);
    }

    // 다이어그램 만들기 버튼 이벤트 리스너
    const makeDiagramBtn = document.getElementById('makeDiagram');
    if (makeDiagramBtn) {
        makeDiagramBtn.addEventListener('click', () => {
            const storedMessages = localStorage.getItem("chatLog");
            if (!storedMessages) {
                alert('대화 내용이 없어 다이어그램을 만들 수 없습니다.');
                return;
            }

            const messages = JSON.parse(storedMessages);
            if (messages.length === 0) {
                alert('대화 내용이 없어 다이어그램을 만들 수 없습니다.');
                return;
            }

            const conversation = [];
            // HTML 문자열을 실제 텍스트로 변환하기 위한 임시 엘리먼트
            const tempDiv = document.createElement('div');

            messages.forEach(msg => {
                const role = msg.role === 'user' ? 'User' : 'AI';
                // 저장된 HTML에서 텍스트 내용만 추출
                tempDiv.innerHTML = msg.html;
                const text = (tempDiv.textContent || tempDiv.innerText || "").trim();
                if (text) {
                    conversation.push(`${role}: ${text}`);
                }
            });

            if (conversation.length > 0) {
                const fullPrompt = "Summarize the following conversation into a Mermaid.js flowchart diagram. Only provide the Mermaid code block, nothing else:\n\n" + conversation.join('\n');
                socket.emit('makdiagram', fullPrompt);
            } else {
                alert('대화 내용이 없어 다이어그램을 만들 수 없습니다.');
            }
        });
    }
});

/**
 * 다이어그램 내용을 동적으로 업데이트하는 함수
 * @param {string} newContent - 새로운 Mermaid 포맷의 문자열
 */
function updateDiagram(newContent) {
    const container = document.getElementById('diagramContent');
    if (container) {
        container.innerHTML = newContent;
        // Mermaid가 이미 처리했다는 표시를 제거
        container.removeAttribute('data-processed');
        // 컨테이너를 다시 렌더링
        mermaid.init(undefined, container);
    }
}

const socket = io();
socket.on("diagram-update", (data) => {
    updateDiagram(data);
});