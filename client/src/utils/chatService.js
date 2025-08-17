import { io } from "socket.io-client";

// 서버가 로컬에서 실행 중이라고 가정합니다. 포트가 다른 경우 이 URL을 수정하세요.
// 예를 들어, Vite 개발 서버를 사용하는 경우 프록시 설정이 필요할 수 있습니다.
const SOCKET_URL = "http://localhost:3000";

class ChatService {
  socket = null;

  connect(onMessageCallback, onDiagramCreatedCallback) {
    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("서버에 연결되었습니다:", this.socket.id);
    });

    this.socket.on("disconnect", () => {
      console.log("서버에서 연결이 끊어졌습니다.");
    });

    this.socket.on("chat message", (msg) => {
      if (onMessageCallback) {
        onMessageCallback(msg);
      }
    });

    this.socket.on("diagram created", (diagram) => {
      if (onDiagramCreatedCallback) {
        onDiagramCreatedCallback(diagram);
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("연결 에러:", err);
    });
  }

  sendMessage(payload) {
    if (this.socket) {
      this.socket.emit("chat message", payload);
    }
  }

  makeDiagram(payload) {
    if (this.socket) {
      this.socket.emit("make diagram", payload);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  } 
}

const chatService = new ChatService();
export default chatService;
