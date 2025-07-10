// chat-management.js

// 사용자 입력 시 텍스트 영역 자동 크기 조절
export function autoResizeTextarea() {
	this.style.height = "auto";
	this.style.height = this.scrollHeight + "px";
}

const socket = io(); // Socket.IO 클라이언트 초기화

function saveChatLogToLocal() {
	const chatLog = document.getElementById("chatLog");
	const messages = [];
	chatLog.querySelectorAll("li").forEach(li => {
		messages.push({
			role: li.classList.contains("user") ? "user" : "ai",
			html: li.innerHTML
		});
	});
	localStorage.setItem("chatLog", JSON.stringify(messages));
}

function loadChatLogFromLocal() {
	const chatLog = document.getElementById("chatLog");
	const messages = JSON.parse(localStorage.getItem("chatLog") || "[]");
	chatLog.innerHTML = "";
	messages.forEach(msg => {
		const li = document.createElement("li");
		li.className = msg.role === "user" ? "bubble user response-box" : "bubble ai response-box";
		li.innerHTML = msg.html;
		chatLog.appendChild(li);
	});
	chatLog.scrollTop = chatLog.scrollHeight;
}

async function gotAnyResponse(content) {
	const chatLog = document.getElementById("chatLog");
	// 기존 마지막 응답 ID 제거 및 새 응답에 ID 부여
	const existingLastResponse = document.getElementById("lastResponse");
	if (existingLastResponse) {
		existingLastResponse.removeAttribute("id");
	}
	const gptMessageLi = document.createElement("li");
	gptMessageLi.classList.add("bubble", "ai", "response-box");
	gptMessageLi.id = "lastResponse";
	gptMessageLi.innerHTML = `<strong>${content}</strong>`;
	chatLog.appendChild(gptMessageLi);
	chatLog.scrollTop = chatLog.scrollHeight;
	// 팝업이 열려있으면 팝업 내용 업데이트
	const popupResponseContent = document.getElementById("popupResponseContent");
	if (popupResponseContent) {
		popupResponseContent.textContent = content;
	}
	saveChatLogToLocal(); // 대화 저장
}

// 서버에서 오는 모든 메시지 수신 (이벤트명 무관)
socket.onAny((event, ...args) => {
	gotAnyResponse(args.join(" "));
});
// 팝업 무조건 닫기 함수
function forceClosePopup() {
	const gptResponsePopup = document.getElementById("gptResponsePopup");
	if (gptResponsePopup) {
		gptResponsePopup.classList.remove("minimized-popup");
		gptResponsePopup.style.display = "none";
	}
}

// 메시지 전송 로직
export function sendChatMessage() {
	const userInputElement = document.getElementById("userInput");
	const input = userInputElement.value;
	if (!input.trim()) return;

	socket.emit("chat message", input);

	const chatLog = document.getElementById("chatLog");

	const userMessageLi = document.createElement("li");
	userMessageLi.classList.add("bubble", "user", "response-box");
	userMessageLi.innerHTML = `<strong>${input}</strong>`;
	chatLog.appendChild(userMessageLi);

	let gptResponseContent = "";
	// 사용자 입력에 따른 ChatGPT 응답 로직
	/*if (input.includes("일본 여행 순서도") || input.includes("단계") || input.includes("시작")) {
		gptResponseContent =
			"네, 일본 여행 순서도는 크게 '여행 목표 및 예산 설정 → 항공권 및 숙소 예약 → 세부 일정 계획 및 현지 정보 조사 → 여행 준비물 확인 및 환전' 등의 단계로 진행됩니다.";
	} else if (input.includes("목표") || input.includes("예산")) {
		gptResponseContent =
			"여행 목표와 예산 설정은 여행의 목적(휴식, 관광 등)과 예상 지출 금액을 정하는 단계입니다. 이 정보가 구체적일수록 다음 단계가 수월해집니다.";
	} else if (input.includes("항공권") || input.includes("숙소")) {
		gptResponseContent =
			"항공권과 숙소 예약 시에는 여권 유효기간 확인, 항공권 최저가 비교, 숙소 위치 및 편의시설 고려가 중요합니다.";
	} else if (input.includes("일정") || input.includes("현지 정보")) {
		gptResponseContent =
			"세부 일정 계획은 방문할 장소, 교통편, 식사 계획을 구체화하는 것이고, 현지 정보 조사는 날씨, 비상 연락처, 문화 등을 파악하는 것입니다.";
	} else if (input.includes("준비물") || input.includes("환전")) {
		gptResponseContent =
			"여행 준비물 확인은 개인 물품, 의류, 상비약 등을 점검하고, 환전은 일본 엔화로 미리 준비하는 단계를 의미합니다.";
	} else {
		gptResponseContent = `'${input}'에 대한 답변입니다.`;
	}

	gotAnyResponse(gptResponseContent);
*/
	userInputElement.value = "";
	userInputElement.style.height = "40px";

	// 목표 요약 업데이트 (goal-summary.js에서 import 해야 함)
	import("./goal-summary.js").then(({ updateGoalSummary }) => {
		updateGoalSummary();
	});

	// 채팅 입력 시 팝업 무조건 닫기
	forceClosePopup();

	saveChatLogToLocal(); // 대화 저장
}

// 페이지 로드시 대화 복원
if (document.readyState === "loading") {
	document.addEventListener('DOMContentLoaded', loadChatLogFromLocal);
} else {
	loadChatLogFromLocal();
}
