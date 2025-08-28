import { io } from "socket.io-client";
import useFlowStore from "./flowStore";
import useUserStore from "./userStore"; // 1. userStore იმპორტი

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (isLocal ? "http://localhost:3000" : window.location.origin);

class ChatService {
  socket = null;
  messageListener = null;

  connect(onMessageCallback) {
    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });
    this.messageListener = onMessageCallback;

    const { setIsConnected } = useFlowStore.getState();

    this.socket.on("connect", () => {
      console.log("서버에 연결되었습니다:", this.socket.id);
      setIsConnected(true);
    });

    this.socket.on("disconnect", () => {
      console.log("서버에서 연결이 끊어졌습니다.");
      setIsConnected(false);
    });

    this.socket.on("chat message", (data) => {
      if (this.messageListener) {
        this.messageListener(data.message);
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("연결 에러:", err);
      setIsConnected(false);
    });
  }

  onNewRecommendations(callback) {
    if (this.socket) {
      this.socket.on('new_recommendations', callback);
    }
  }

  offNewRecommendations(callback) {
    if (this.socket) {
      this.socket.off('new_recommendations', callback);
    }
  }

  sendMessage(payload, chatLog = []) { // Add chatLog parameter with default empty array
    if (this.socket) {
      const currentMode = useFlowStore.getState().mode || 'worry';
      const userNote = useUserStore.getState().userNote; // 2. userNote 가져오기
      let msgPayload;
      if (typeof payload === 'string') {
        msgPayload = { text: payload, mode: currentMode, userNote }; // 3. userNote 페이로드에 추가
      } else if (payload && typeof payload === 'object') {
        msgPayload = { ...payload, mode: payload.mode || currentMode, userNote }; // 3. userNote 페이로드에 추가
      } else {
        msgPayload = { text: String(payload), mode: currentMode, userNote }; // 3. userNote 페이로드에 추가
      }
      // Emit both the message payload and the full chat log
      this.socket.emit("chat message", { msgPayload, chatLog });
    }
  }

  resubmit(chatHistory) {
    if (this.socket) {
      this.socket.emit("resubmit chat", chatHistory);
    }
  }
  
  makeDiagram(payload, callback) {
    if (this.socket) {
      this.socket.emit("make diagram", payload, (response) => {
        if (callback) {
          callback(response);
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