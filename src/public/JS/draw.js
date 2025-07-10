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
