// chat-management.js

// 사용자 입력 시 텍스트 영역 자동 크기 조절
export function autoResizeTextarea() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
}

// 메시지 전송 로직
export function sendChatMessage() {
    const userInputElement = document.getElementById('userInput');
    const input = userInputElement.value;
    if (!input.trim()) return;

    const chatLog = document.getElementById('chatLog');

    const userMessageDiv = document.createElement('li');
    userMessageDiv.classList.add('response-box', 'user');
    userMessageDiv.innerHTML = `<strong>사용자:</strong> ${input}`;
    chatLog.appendChild(userMessageDiv);

    let gptResponseContent = "";
    // 사용자 입력에 따른 ChatGPT 응답 로직
    if (input.includes("일본 여행 순서도") || input.includes("단계") || input.includes("시작")) {
        gptResponseContent = "네, 일본 여행 순서도는 크게 '여행 목표 및 예산 설정 → 항공권 및 숙소 예약 → 세부 일정 계획 및 현지 정보 조사 → 여행 준비물 확인 및 환전' 등의 단계로 진행됩니다.";
    } else if (input.includes("목표") || input.includes("예산")) {
        gptResponseContent = "여행 목표와 예산 설정은 여행의 목적(휴식, 관광 등)과 예상 지출 금액을 정하는 단계입니다. 이 정보가 구체적일수록 다음 단계가 수월해집니다.";
    } else if (input.includes("항공권") || input.includes("숙소")) {
        gptResponseContent = "항공권과 숙소 예약 시에는 여권 유효기간 확인, 항공권 최저가 비교, 숙소 위치 및 편의시설 고려가 중요합니다.";
    } else if (input.includes("일정") || input.includes("현지 정보")) {
        gptResponseContent = "세부 일정 계획은 방문할 장소, 교통편, 식사 계획을 구체화하는 것이고, 현지 정보 조사는 날씨, 비상 연락처, 문화 등을 파악하는 것입니다.";
    } else if (input.includes("준비물") || input.includes("환전")) {
        gptResponseContent = "여행 준비물 확인은 개인 물품, 의류, 상비약 등을 점검하고, 환전은 일본 엔화로 미리 준비하는 단계를 의미합니다.";
    } else {
        gptResponseContent = `'${input}'에 대한 답변입니다.`;
    }

    // 줄바꿈, 탭 등은 건드리지 않고 원본 그대로 사용
    const cleanedGptResponseContent = gptResponseContent.trim().replace(/\n{2,}/g, '\n').replace(/\t/g, ' ');

    // 기존 마지막 응답 ID 제거 및 새 응답에 ID 부여
    const existingLastResponse = document.getElementById('lastResponse');
    if (existingLastResponse) {
        existingLastResponse.removeAttribute('id');
    }

    const gptMessageDiv = document.createElement('li');
    gptMessageDiv.classList.add('response-box', 'gpt');
    gptMessageDiv.id = 'lastResponse'; // 마지막 응답으로 설정
    gptMessageDiv.innerHTML = `<strong>ChatGPT:</strong> ${cleanedGptResponseContent}`;
    chatLog.appendChild(gptMessageDiv);

    chatLog.scrollTop = chatLog.scrollHeight; // 스크롤을 최하단으로 이동

    userInputElement.value = ''; // 입력창 초기화
    userInputElement.style.height = '40px'; // 입력창 높이 초기화

    // 팝업이 열려있으면 팝업 내용 업데이트 (gptResponsePopup은 main.js에서 import 해야 함)
    const gptResponsePopup = document.getElementById('gptResponsePopup');
    const popupResponseContent = document.getElementById('popupResponseContent');
    if (gptResponsePopup && popupResponseContent && gptResponsePopup.style.display === 'block') {
        // 팝업에만 줄바꿈을 없애고 한 줄로 표시 + 앞뒤 줄바꿈 완전 제거
        popupResponseContent.textContent = cleanedGptResponseContent.replace(/^[\n\s]+|[\n\s]+$/g, '').replace(/\n+/g, ' ').replace(/\t+/g, ' ').replace(/\s{2,}/g, ' ');
    }

    // 목표 요약 업데이트 (goal-summary.js에서 import 해야 함)
    import('./goal-summary.js').then(({ updateGoalSummary }) => {
        updateGoalSummary();
    });
}