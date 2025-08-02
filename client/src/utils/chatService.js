// client/src/utils/chatService.js

import { io } from "socket.io-client";
// import { updateGoalSummary } from "./goal-summary.js"; // goal-summary.js가 있다고 가정

// --- 상수 정의 ---
const SOCKET_SERVER_URL = "http://localhost:5173"; // 실제 서버 주소로 변경해야 합니다.
const CHAT_LOG_ID = "chatLog";
const USER_INPUT_ID = "userInput";
const LAST_RESPONSE_ID = "lastResponse";
const TYPING_INDICATOR_ID = "gptTyping";
const POPUP_RESPONSE_CONTENT_ID = "popupResponseContent";
const GPT_RESPONSE_POPUP_ID = "gptResponsePopup";

const CSS_CLASSES = {
    USER_BUBBLE: "bubble user response-box",
    AI_BUBBLE: "bubble ai response-box",
    MINIMIZED_POPUP: "minimized-popup",
};

// --- 소켓 초기화 ---
const socket = io(SOCKET_SERVER_URL);

// --- 상태 관리 ---
let isFirstChat = true;

// --- DOM 조작 함수 ---

/**
 * 새로운 채팅 메시지를 화면에 추가합니다.
 * @param {string} text - 메시지 내용
 * @param {'user' | 'ai'} role - 메시지 주체 (사용자 또는 AI)
 * @returns {HTMLLIElement} 생성된 li 요소
 */
const createMessageBubble = (text, role) => {
    const chatLog = document.getElementById(CHAT_LOG_ID);
    const messageLi = document.createElement("li");
    messageLi.className = role === "user" ? CSS_CLASSES.USER_BUBBLE : CSS_CLASSES.AI_BUBBLE;
    messageLi.innerHTML = `<strong>${text}</strong>`;
    chatLog.appendChild(messageLi);
    scrollToBottom(chatLog);
    return messageLi;
};

/**
 * "입력 중..." 표시를 화면에 보여주거나 숨깁니다.
 * @param {boolean} show - 표시 여부
 */
const toggleTypingIndicator = (show) => {
    const chatLog = document.getElementById(CHAT_LOG_ID);
    let typingLi = document.getElementById(TYPING_INDICATOR_ID);

    if (show) {
        if (!typingLi) {
            typingLi = document.createElement("li");
            typingLi.className = CSS_CLASSES.AI_BUBBLE;
            typingLi.id = TYPING_INDICATOR_ID;
            typingLi.innerHTML = "<strong>입력중...</strong>";
            chatLog.appendChild(typingLi);
            scrollToBottom(chatLog);
        }
    } else {
        if (typingLi) {
            chatLog.removeChild(typingLi);
        }
    }
};

/**
 * 스크롤을 맨 아래로 이동시킵니다.
 * @param {HTMLElement} element - 스크롤할 요소
 */
const scrollToBottom = (element) => {
    if (element) {
        element.scrollTop = element.scrollHeight;
    }
};

/**
 * 팝업을 강제로 닫습니다.
 */
const forceClosePopup = () => {
    const gptResponsePopup = document.getElementById(GPT_RESPONSE_POPUP_ID);
    if (gptResponsePopup) {
        gptResponsePopup.classList.remove(CSS_CLASSES.MINIMIZED_POPUP);
        gptResponsePopup.style.display = "none";
    }
};

/**
 * 텍스트 영역의 크기를 자동으로 조절합니다.
 * @param {HTMLTextAreaElement} textarea - 대상 텍스트 영역
 */
export const autoResizeTextarea = (textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
};


// --- 로컬 스토리지 관리 ---

/**
 * 현재 채팅 기록을 로컬 스토리지에 저장합니다.
 */
const saveChatLogToLocal = () => {
    const chatLog = document.getElementById(CHAT_LOG_ID);
    if (!chatLog) return;

    const messages = Array.from(chatLog.querySelectorAll("li"))
        .filter(li => li.id !== TYPING_INDICATOR_ID) // "입력중" 표시는 저장하지 않음
        .map((li) => ({
            role: li.classList.contains("user") ? "user" : "ai",
            html: li.innerHTML,
        }));

    try {
        localStorage.setItem("chatLog", JSON.stringify(messages));
    } catch (error) {
        console.error("채팅 기록 저장에 실패했습니다.", error);
    }
};

/**
 * 로컬 스토리지에서 채팅 기록을 불러와 화면에 표시합니다.
 */
const loadChatLogFromLocal = () => {
    const chatLog = document.getElementById(CHAT_LOG_ID);
    if (!chatLog) return;

    try {
        const messages = JSON.parse(localStorage.getItem("chatLog") || "[]");
        chatLog.innerHTML = "";
        messages.forEach((msg) => {
            const li = document.createElement("li");
            li.className = msg.role === "user" ? CSS_CLASSES.USER_BUBBLE : CSS_CLASSES.AI_BUBBLE;
            li.innerHTML = msg.html;
            chatLog.appendChild(li);
        });
        scrollToBottom(chatLog);
        isFirstChat = messages.length === 0;
    } catch (error) {
        console.error("채팅 기록 불러오기에 실패했습니다.", error);
        localStorage.removeItem("chatLog");
    }
};

// --- 서버 통신 ---

/**
 * 서버로부터 받은 AI 응답을 처리하고 타이핑 효과와 함께 표시합니다.
 * @param {string} content - AI 응답 내용
 */
const handleAiResponse = (content) => {
    toggleTypingIndicator(false);

    const chatLog = document.getElementById(CHAT_LOG_ID);
    const existingLastResponse = document.getElementById(LAST_RESPONSE_ID);
    if (existingLastResponse) {
        existingLastResponse.removeAttribute("id");
    }

    const gptMessageLi = createMessageBubble("", "ai");
    gptMessageLi.id = LAST_RESPONSE_ID;
    const strongElem = gptMessageLi.querySelector("strong");

    const popupResponseContent = document.getElementById(POPUP_RESPONSE_CONTENT_ID);
    if (popupResponseContent) {
        popupResponseContent.textContent = "";
    }

    let i = 0;
    const typeChar = () => {
        if (i <= content.length) {
            const typedText = content.slice(0, i);
            strongElem.textContent = typedText;
            if (popupResponseContent) {
                popupResponseContent.textContent = typedText;
            }
            scrollToBottom(chatLog);
            i++;
            setTimeout(typeChar, 18);
        } else {
            saveChatLogToLocal();
        }
    };
    typeChar();
};

/**
 * 로컬 스토리지의 채팅 기록을 서버 전송용 형식으로 변환합니다.
 * @returns {Array<{role: string, content: string}>}
 */
const getHistoryForServer = () => {
    try {
        const chatLog = localStorage.getItem("chatLog");
        if (!chatLog) return [];

        const messages = JSON.parse(chatLog);
        return messages.map(msg => {
            const tempEl = document.createElement('div');
            tempEl.innerHTML = msg.html;
            const content = tempEl.querySelector('strong')?.textContent || tempEl.textContent;
            return {
                role: msg.role === 'ai' ? 'assistant' : msg.role,
                content: content
            };
        });
    } catch (error) {
        console.error("채팅 기록 변환에 실패했습니다.", error);
        return [];
    }
};

/**
 * 사용자 메시지를 서버로 전송합니다.
 */
export const sendChatMessage = () => {
    const userInputElement = document.getElementById(USER_INPUT_ID);
    const input = userInputElement.value.trim();
    if (!input) return;

    createMessageBubble(input, "user");
    saveChatLogToLocal();

    const history = getHistoryForServer();
    socket.emit("chat message", { message: input, history: history });

    toggleTypingIndicator(true);

    userInputElement.value = "";
    autoResizeTextarea(userInputElement);

    // updateGoalSummary();
    forceClosePopup();

    if (isFirstChat) {
        isFirstChat = false;
        userInputElement.placeholder = "질문에 대답하기";
    }
};

// --- 이벤트 리스너 설정 ---

// 서버에서 오는 메시지 수신
socket.on("chat message", (message) => {
    handleAiResponse(message);
});

// 페이지 로드 시 대화 기록 복원
document.addEventListener("DOMContentLoaded", loadChatLogFromLocal);
