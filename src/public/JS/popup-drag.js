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

// 팝업 축소/복원 상태 변수
let isPopupMinimized = false;

// < 축소 버튼 생성 (팝업 우상단)
const minimizeBtn = document.createElement('button');
minimizeBtn.id = 'popupMinimizeBtn';
minimizeBtn.innerHTML = '&#x2039;'; // <
minimizeBtn.title = '축소';
minimizeBtn.style.position = 'absolute';
minimizeBtn.style.right = '10px';
minimizeBtn.style.top = '10px';
minimizeBtn.style.zIndex = '200';
minimizeBtn.style.background = '#2563eb';
minimizeBtn.style.color = 'white';
minimizeBtn.style.border = 'none';
minimizeBtn.style.borderRadius = '10px';
minimizeBtn.style.width = '28px';
minimizeBtn.style.height = '40px';
minimizeBtn.style.cursor = 'pointer';
minimizeBtn.style.display = 'block';
gptResponsePopup.appendChild(minimizeBtn);

// > 복원 버튼 생성 (왼쪽 끝, 세로로 긴 버튼)
const restoreBtn = document.createElement('button');
restoreBtn.id = 'popupRestoreBtn';
restoreBtn.innerHTML = '&#x203A;'; // >
restoreBtn.title = '복원';
restoreBtn.style.position = 'fixed';
restoreBtn.style.left = '0';
restoreBtn.style.top = '50%';
restoreBtn.style.transform = 'translateY(-50%)';
restoreBtn.style.zIndex = '201';
restoreBtn.style.background = '#2563eb';
restoreBtn.style.color = 'white';
restoreBtn.style.border = 'none';
restoreBtn.style.borderRadius = '0 10px 10px 0';
restoreBtn.style.width = '32px';
restoreBtn.style.height = '100px';
restoreBtn.style.cursor = 'pointer';
restoreBtn.style.display = 'none';
document.body.appendChild(restoreBtn);

// 축소 함수
function minimizePopup() {
    if (isPopupMinimized) return;
    gptResponsePopup.classList.add('popup-minimized');
    gptResponsePopup.style.display = 'none';
    minimizeBtn.style.display = 'none';
    restoreBtn.style.display = 'block';
    isPopupMinimized = true;
}
// 복원 함수
function restorePopup() {
    if (!isPopupMinimized) return;
    gptResponsePopup.classList.remove('popup-minimized');
    gptResponsePopup.style.display = 'block';
    minimizeBtn.style.display = 'block';
    restoreBtn.style.display = 'none';
    isPopupMinimized = false;
}
// < 버튼 클릭 시 축소
minimizeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    minimizePopup();
});
// > 버튼 클릭 시 복원
restoreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    restorePopup();
});

// 팝업/버튼 무조건 숨김 함수
function forceHidePopupAndButtons() {
    if (gptResponsePopup) {
        gptResponsePopup.style.display = 'none';
    }
    if (minimizeBtn) {
        minimizeBtn.style.display = 'none';
    }
    if (restoreBtn) {
        restoreBtn.style.display = 'none';
    }
}

// 예시: chat-management.js 등에서 채팅창 열릴 때 forceHidePopupAndButtons() 호출
// 채팅창 열기: showPopupAndMinimizeBtn();
// 채팅창 닫기: minimizePopupAndShowRestoreBtn();