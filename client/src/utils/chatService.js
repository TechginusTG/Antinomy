import { io } from "socket.io-client";
import useFlowStore from "./flowStore";

// 서버가 로컬에서 실행 중이라고 가정합니다. 포트가 다른 경우 이 URL을 수정하세요.
// 예를 들어, Vite 개발 서버를 사용하는 경우 프록시 설정이 필요할 수 있습니다.
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (isLocal ? "http://localhost:3000" : window.location.origin);

class ChatService {
  socket = null;

  connect(onMessageCallback) {
    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    const { setIsConnected } = useFlowStore.getState();

    this.socket.on("connect", () => {
      console.log("서버에 연결되었습니다:", this.socket.id);
      setIsConnected(true);
    });

    this.socket.on("disconnect", () => {
      console.log("서버에서 연결이 끊어졌습니다.");
      setIsConnected(false);
    });

    this.socket.on("chat message", (msg) => {
      if (onMessageCallback) {
        onMessageCallback(msg);
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("연결 에러:", err);
      setIsConnected(false);
    });
  }

  sendMessage(payload) {
    if (this.socket) {
      this.socket.emit("chat message", payload);
    }
  }

  resubmit(chatHistory, onMessageCallback) {
    if (this.socket) {
      this.socket.emit("resubmit chat", chatHistory);
      this.socket.once("chat message", (msg) => {
        if (onMessageCallback) {
          onMessageCallback(msg);
        }
      });
    }
  }

  loadChatHistory(chatHistory) {
    if (this.socket) {
      this.socket.emit("load chat history", chatHistory);
    }
  }

  makeDiagram(payload, onDiagramCreatedCallback) {
    if (this.socket) {
      this.socket.emit("make diagram", payload);
      this.socket.once("diagram created", (diagram) => {
        if (onDiagramCreatedCallback) {
          onDiagramCreatedCallback(diagram);
        }
      });
    }
  }

  resetChat() {
    if (this.socket) {
      this.socket.emit("reset chat");
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
