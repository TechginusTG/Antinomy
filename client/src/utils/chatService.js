import { io } from "socket.io-client";
import useFlowStore from "./flowStore";
import { saveChatLog, loadChatLog, clearChatLog } from "./chatStorage";

// 서버가 로컬에서 실행 중이라고 가정합니다. 포트가 다른 경우 이 URL을 수정하세요.
// 예를 들어, Vite 개발 서버를 사용하는 경우 프록시 설정이 필요할 수 있습니다.
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (isLocal ? "http://localhost:3000" : window.location.origin);

class ChatService {
  socket = null;
  chatHistory = []; // Add chatHistory property

  constructor() { // Add constructor to load initial chat history
    this.chatHistory = loadChatLog();
  }

  connect(onMessageCallback) {
    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    const { setIsConnected } = useFlowStore.getState();

    this.socket.on("connect", () => {
      console.log("서버에 연결되었습니다:", this.socket.id);
      setIsConnected(true);
      // Pass initial chat history to the callback if needed by the component
      if (onMessageCallback) {
        onMessageCallback(this.chatHistory);
      }
    });

    this.socket.on("disconnect", () => {
      console.log("서버에서 연결이 끊어졌습니다.");
      setIsConnected(false);
    });

    this.socket.on("chat message", (msg) => {
      // Append new message to chatHistory
      this.chatHistory.push(msg);
      saveChatLog(this.chatHistory); // Save updated chat history
      if (onMessageCallback) {
        onMessageCallback(this.chatHistory); // Pass the entire updated history
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

  resubmit(onMessageCallback) { // Removed chatHistory parameter as it's managed internally
    if (this.socket) {
      this.socket.emit("resubmit chat", this.chatHistory); // Use internal chatHistory
      this.socket.once("chat message", (msg) => {
        // This part is handled by the general "chat message" listener now
        // The onMessageCallback here is for the *response* to resubmit, not the full history
        // So, we should just pass the new message, and the main listener will update history
        if (onMessageCallback) {
          onMessageCallback(msg);
        }
      });
    }
  }

  loadChatHistory(chatHistory) { // This function seems redundant now, but keeping for now
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
      this.chatHistory = []; // Clear internal chat history
      clearChatLog(); // Clear localStorage
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
