import { io } from "socket.io-client";

// 서버가 로컬에서 실행 중이라고 가정합니다. 포트가 다른 경우 이 URL을 수정하세요.
// 예를 들어, Vite 개발 서버를 사용하는 경우 프록시 설정이 필요할 수 있습니다.
const SOCKET_URL = "http://localhost:3000";

class ChatService {
  socket = null;

  connect(onMessageCallback) {
    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("서버에 연결되었습니다:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("서버에서 연결이 끊어졌습니다.");
    });

    // 서버로부터 'chat message' 이벤트를 수신합니다.
    this.socket.on("chat message", (msg) => {
      if (onMessageCallback) {
        onMessageCallback(msg);
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("연결 에러:", err);
    });
  }

  sendMessage(message) {
    if (this.socket) {
      // 서버로 'chat message' 이벤트를 보냅니다.
      this.socket.emit("chat message", message);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  saveChatLog(filename) {
    const chatLogString = localStorage.getItem("chatLog");
    const chatLog = chatLogString ? JSON.parse(chatLogString) : [];

    // 유효성 검사: 배열인지 확인하고, 각 항목이 {text, sender} 구조인지 (선택적)
    if (!Array.isArray(chatLog)) {
      console.error("chatLog is not an array");
      return;
    }

    // JSON 문자열로 변환 (예쁘게 포맷팅)
    const jsonContent = JSON.stringify(chatLog, null, 2);

    // Blob 객체 생성
    const blob = new Blob([jsonContent], { type: "application/json" });

    // 다운로드 URL 생성
    const url = URL.createObjectURL(blob);

    // a 태그 생성 및 클릭 시뮬레이션으로 다운로드
    const a = document.createElement("a");
    a.href = url;
    const chatLogFilename = filename
      ? filename.replace(/\.json$/i, "-chat.json")
      : "chatLog.json";
    a.download = chatLogFilename; // 파일 이름 설정
    document.body.appendChild(a);
    a.click();

    // 정리
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`chatLog가 ${chatLogFilename} 파일로 저장되었습니다!`);
  }
}

const chatService = new ChatService();
export default chatService;
