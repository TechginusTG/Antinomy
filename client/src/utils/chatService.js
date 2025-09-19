import { io } from "socket.io-client";
import useFlowStore from "./flowStore";
import useUserStore from "./userStore"; // 1. userStore იმპორტი

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (isLocal ? "http://localhost:3000" : window.location.origin);

class ChatService {
  socket = null;
  messageListener = null;

  connect(onMessageCallback, onConnectCallback) {
    const token = localStorage.getItem("authToken");

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });
    this.messageListener = onMessageCallback;

    const { setIsConnected } = useFlowStore.getState();

    this.socket.on("connect", () => {
      console.log("서버에 연결되었습니다:", this.socket.id);
      setIsConnected(true);
    });

    this.socket.on("ready", () => {
      console.log("Socket is ready.");
      if (onConnectCallback) {
        onConnectCallback();
      }
    });

    this.socket.on("disconnect", () => {
      console.log("서버에서 연결이 끊어졌습니다.");
      setIsConnected(false);
    });

    this.socket.on("chat message", (data) => {
      if (this.messageListener) {
        this.messageListener(data);
      }
    });

    this.socket.on("connect_error", (err) => {
      console.error("연결 에러:", err);
      setIsConnected(false);
    });

    this.socket.on("get_exp", (stats) => {
      console.log("Received stats update:", stats);
      useUserStore.getState().setStats(stats);
    });
  }

  onNewRecommendations(callback) {
    if (this.socket) {
      this.socket.on("new_recommendations", callback);
    }
  }

  offNewRecommendations(callback) {
    if (this.socket) {
      this.socket.off("new_recommendations", callback);
    }
  }

  sendMessage(payload, chatLog = [], conversationId) {
    if (this.socket) {
      const currentMode = useFlowStore.getState().mode || "worry";
      const aiProvider = useFlowStore.getState().aiProvider || "gemini";
      const userNote = useUserStore.getState().userNote; // 2. userNote 가져오기
      let msgPayload;
      if (typeof payload === "string") {
        msgPayload = {
          text: payload,
          mode: currentMode,
          userNote,
          conversationId,
          aiProvider,
        };
      } else if (payload && typeof payload === "object") {
        msgPayload = {
          ...payload,
          mode: payload.mode || currentMode,
          userNote,
          conversationId,
          aiProvider,
        };
      } else {
        msgPayload = {
          text: String(payload),
          mode: currentMode,
          userNote,
          conversationId,
          aiProvider,
        };
      }
      // Emit both the message payload and the full chat log
      this.socket.emit("chat message", { msgPayload, chatLog });
    }
  }

  editMessage(messageId, newContent, conversationId) {
    if (this.socket) {
      this.socket.emit("edit message", {
        messageId,
        newContent,
        conversationId,
      });
    }
  }

  async likeMessage(chatId, mode) {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Authentication token not found.");
      return false;
    }

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chatId, mode }),
      });

      if (response.ok) {
        console.log(`Message ${chatId} liked successfully.`);
        return true;
      } else {
        const errorData = await response.json();
        console.error("Failed to like message:", errorData.message);
        alert(`Error: ${errorData.message}`);
        return false;
      }
    } catch (error) {
      console.error("Error liking message:", error);
      alert("A network error occurred. Please try again.");
      return false;
    }
  }

  async unlikeMessage(chatId) {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Authentication token not found.");
      return false;
    }

    try {
      const response = await fetch(`/api/feedback/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log(`Message ${chatId} unliked successfully.`);
        return true;
      } else {
        const errorData = await response.json();
        console.error("Failed to unlike message:", errorData.message);
        alert(`Error: ${errorData.message}`);
        return false;
      }
    } catch (error) {
      console.error("Error unliking message:", error);
      alert("A network error occurred. Please try again.");
      return false;
    }
  }

  deleteMessagesFrom(messageId, conversationId) {
    if (this.socket) {
      this.socket.emit("delete msg", {
        messageId,
        conversationId,
      });
    }
  }

  onMessagesDeleted(callback) {
    if (this.socket) {
      this.socket.on("msg deleted", callback);
    }
  }

  offMessagesDeleted(callback) {
    if (this.socket) {
      this.socket.off("msg deleted", callback);
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

  loadChatHistory(conversationId) {
    if (this.socket) {
      this.socket.emit("load latest chat", { conversationId });
    }
  }

  onChatHistoryLoaded(callback) {
    if (this.socket) {
      this.socket.on("chat history loaded", callback);
    }
  }

  offChatHistoryLoaded(callback) {
    if (this.socket) {
      this.socket.off("chat history loaded", callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async getLikedMessages() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Authentication token not found.");
      return [];
    }

    try {
      const response = await fetch("/api/feedback", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch liked messages:", errorData.message);
        return [];
      }
    } catch (error) {
      console.error("Error fetching liked messages:", error);
      return [];
    }
  }
}

const chatService = new ChatService();
export default chatService;
