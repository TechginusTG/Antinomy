// popup-drag.js

// 팝업 드래그 관련 변수
const gptResponsePopup = document.getElementById('gptResponsePopup');
let isDragging = false;
let offsetX, offsetY;

if (gptResponsePopup) {
    // 팝업 드래그 시작
    gptResponsePopup.addEventListener('mousedown', (e) => {
        // 팝업 헤더, 팝업 자체, 팝업 콘텐츠 클릭 시 드래그 시작
        if (e.target.closest('.popup-header') || e.target === gptResponsePopup || e.target.closest('.popup-content')) {
            isDragging = true;
            gptResponsePopup.style.zIndex = '101'; // 드래그 중 맨 위로
            // 마우스와 팝업 간의 오프셋 계산
            offsetX = e.clientX - gptResponsePopup.getBoundingClientRect().left;
            offsetY = e.clientY - gptResponsePopup.getBoundingClientRect().top;
            gptResponsePopup.style.cursor = 'grabbing'; // 커서 변경
        }
    });

    // 팝업 드래그 중 이동
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const diagram = document.getElementById('diagram');
        if (!diagram) return; // diagram 요소가 없으면 중단

        const diagramRect = diagram.getBoundingClientRect(); // 다이어그램 영역 경계
        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;

        // 팝업이 다이어그램 영역을 벗어나지 않도록 제한
        if (newLeft < diagramRect.left) newLeft = diagramRect.left;
        if (newLeft + gptResponsePopup.offsetWidth > diagramRect.right) {
            newLeft = diagramRect.right - gptResponsePopup.offsetWidth;
        }
        if (newTop < diagramRect.top) newTop = diagramRect.top;
        if (newTop + gptResponsePopup.offsetHeight > diagramRect.bottom) {
            newTop = diagramRect.bottom - gptResponsePopup.offsetHeight;
        }

        // 팝업 위치 업데이트
        gptResponsePopup.style.left = `${newLeft}px`;
        gptResponsePopup.style.top = `${newTop}px`;
        gptResponsePopup.style.transform = 'none'; // translate 초기화
    });

    // 팝업 드래그 종료
    document.addEventListener('mouseup', () => {
        isDragging = false;
        if (gptResponsePopup) {
            gptResponsePopup.style.cursor = 'grab'; // 커서 원래대로
            gptResponsePopup.style.zIndex = '100'; // z-index 원래대로
            // 구석(오른쪽 하단) 근처면 최소화
            const diagram = document.getElementById('diagram');
            if (diagram && !isPopupMinimized) {
                const popupRect = gptResponsePopup.getBoundingClientRect();
                const diagramRect = diagram.getBoundingClientRect();
                if (
                    popupRect.right > diagramRect.right - MINIMIZE_MARGIN &&
                    popupRect.bottom > diagramRect.bottom - MINIMIZE_MARGIN
                ) {
                    minimizePopup();
                }
            }
        }
    });
}


// 팝업 내용 설정 함수
function setPopupContent(content) {
    const popupResponseContent = gptResponsePopup.querySelector('.popup-response-content');
    if (popupResponseContent) {
        // HTML 태그 제거 및 줄바꿈 처리
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const cleanedGptResponseContent = tempDiv.textContent || tempDiv.innerText || '';
        popupResponseContent.textContent = cleanedGptResponseContent;
    }
}
