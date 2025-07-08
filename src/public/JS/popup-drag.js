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

// 최소화 상태 관리 변수
let isPopupMinimized = false;

// 최소화 버튼 생성 및 삽입 (오른쪽 상단에 > 버튼)
const minimizeBtn = document.createElement('button');
minimizeBtn.id = 'popupMinimizeBtn';
minimizeBtn.innerHTML = '&#x203A;'; // > 모양
minimizeBtn.title = '최소화';
minimizeBtn.style.position = 'absolute';
minimizeBtn.style.right = '10px';
minimizeBtn.style.top = '10px';
minimizeBtn.style.zIndex = '200';
minimizeBtn.style.background = '#2563eb';
minimizeBtn.style.color = 'white';
minimizeBtn.style.border = 'none';
minimizeBtn.style.borderRadius = '10px';
minimizeBtn.style.width = '28px';
minimizeBtn.style.height = '28px';
minimizeBtn.style.cursor = 'pointer';
minimizeBtn.style.display = 'block';
gptResponsePopup.appendChild(minimizeBtn);

// 복원 버튼 생성 및 삽입 (최소화 상태에서 < 버튼)
const restoreBtn = document.createElement('button');
restoreBtn.id = 'popupRestoreBtn';
restoreBtn.innerHTML = '&#x2039;'; // < 모양
restoreBtn.title = '복원';
restoreBtn.style.position = 'fixed';
restoreBtn.style.right = '20px';
restoreBtn.style.bottom = '80px';
restoreBtn.style.zIndex = '201';
restoreBtn.style.background = '#2563eb';
restoreBtn.style.color = 'white';
restoreBtn.style.border = 'none';
restoreBtn.style.borderRadius = '10px 0 0 10px';
restoreBtn.style.width = '28px';
restoreBtn.style.height = '40px';
restoreBtn.style.cursor = 'pointer';
restoreBtn.style.display = 'none';
document.body.appendChild(restoreBtn);

// 팝업 최소화 함수
function minimizePopup() {
    gptResponsePopup.style.display = 'none'; // 팝업 전체 숨김
    minimizeBtn.style.display = 'none';
    restoreBtn.style.display = 'block'; // 복원 버튼만 보이게
    isPopupMinimized = true;
}

// 팝업 복원 함수
function restorePopup() {
    gptResponsePopup.style.display = 'block'; // 팝업 다시 보이기
    minimizeBtn.style.display = 'block';
    restoreBtn.style.display = 'none';
    isPopupMinimized = false;
}

// > 버튼 클릭 시 최소화
minimizeBtn.addEventListener('click', minimizePopup);
// < 버튼 클릭 시 복원
restoreBtn.addEventListener('click', restorePopup);

// 팝업 내용 설정 함수
function setPopupContent(content) {
    const popupResponseContent = gptResponsePopup.querySelector('.popup-response-content');
    if (popupResponseContent) {
        // HTML 태그 제거 및 줄바꿈 처리
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const cleanedGptResponseContent = tempDiv.textContent || tempDiv.innerText || '';

        // 원래대로: 줄바꿈 등은 한 줄로 치환하지 않고 cleanedGptResponseContent 그대로 사용
        popupResponseContent.textContent = cleanedGptResponseContent;
    }
}