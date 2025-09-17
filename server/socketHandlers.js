import genAI from "./geminiClient.js";
import { systemPrompt } from "./prompt/systemPrompt.js";
import { recommendPrompt } from "./prompt/recommendPrompt.js";
import { modes as prompts } from "./prompt/modes.js";
import { diagramPrompt } from "./prompt/diagramPrompt.js";
import db from "./db.js";
import jwt from "jsonwebtoken";

const EXP_REWARDS = {
  CHAT: 10,
};

const userSpecial = {}; 

function handleAiResponse(socket, reply, conversationId, userMessageDbId = null) {
  const saveAiMessage = async (message) => {
    if (socket.userId && conversationId && message) {
      try {
        await db("chats").insert({
          user_id: socket.userId,
          conversation_id: conversationId,
          sender: "ai",
          message: message,
        });
        console.log(
          `[DB] AI message saved for user: ${socket.userId}, conversation: ${conversationId}`
        );
      } catch (error) {
        console.error("[DB] Error saving AI message:", error);
      }
    }
  };

  try {
    const parsedReply = JSON.parse(reply);
    if (parsedReply.chat_response && parsedReply.recommendations) {
      const chatMessage = parsedReply.chat_response;
      saveAiMessage(chatMessage);
      socket.emit("chat message", { message: chatMessage, id: userMessageDbId });
      socket.emit("new_recommendations", parsedReply.recommendations);
      console.log(`Gemini 응답 (추천 포함) [${socket.id}]:`, parsedReply);
    } else {
      throw new Error("Invalid JSON format for recommendations");
    }
  } catch (parseError) {
    saveAiMessage(reply);
    socket.emit("chat message", { message: reply, id: userMessageDbId });
    console.log(`Gemini 응답 [${socket.id}]:`, reply);
  }
}

function buildSystemPrompt(socketId) {
  const { mode = "basic", userNote = "" } = userSpecial[socketId] || {};
  const selectedModePrompt = prompts[mode] || prompts.basic;
  const promptParts = [
    systemPrompt,
    recommendPrompt,
    `MODE=${mode}:${selectedModePrompt}`,
  ];
  if (userNote) {
    promptParts.push(
      `This user has the following traits: ${userNote}. When you answer, you should be care these properties.`
    );
  }
  return promptParts.join("\n\n");
}

function convertToGeminiHistory(chatHistory, socketId) {
  const system = buildSystemPrompt(socketId);
  const history = [];
  history.push({ role: "user", parts: [{ text: `Please follow these instructions for our entire conversation: ${system}` }] });
  history.push({ role: "model", parts: [{ text: "Understood. I will follow all instructions." }] });

  chatHistory.forEach(msg => {
    if (!msg.content) return;
    history.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  });

  return history;
}

async function callGemini(socket, chatLog, conversationId, userMessageDbId = null) { // userMessageDbId 추가
  if (!genAI) {
    console.error("Gemini client is not initialized. Check your GEMINI_API_KEY.");
    socket.emit("chat message", { message: "AI 서비스가 설정되지 않았습니다. 💀" });
    return false;
  }
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const history = convertToGeminiHistory(chatLog, socket.id);
    
    if(history.length > 0 && history[history.length - 1].role === 'model') {
        history.push({ role: "user", parts: [{ text: "..." }] });
    }
    const lastMessage = history.pop();

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const reply = result.response.text();

    handleAiResponse(socket, reply, conversationId, userMessageDbId);
    return true;
  } catch (err) {
    console.error("Gemini Error:", err);
    socket.emit("chat message", { message: "AI 서비스 호출에 실패했습니다. 💀" });
    return false;
  }
}

async function grantExp(socket, userId, expToGrant) {
  if (!userId) return;
  try {
    const user = await db("users").where({ user_id: userId }).first();
    if (user) {
      const currentExp = user.exp || 0;
      const currentLvl = user.lvl || 1;
      let newExp = currentExp + expToGrant;
      let newLvl = currentLvl;
      let requiredExp = newLvl * 100;
      while (newExp >= requiredExp) {
        newExp -= requiredExp;
        newLvl++;
        requiredExp = newLvl * 100;
      }
      await db("users").where({ user_id: userId }).update({ exp: newExp, lvl: newLvl });
      console.log(
        `[EXP] User ${userId} granted ${expToGrant} EXP. New stats: LVL ${newLvl}, EXP ${newExp}`
      );
      socket.emit("get_exp", { lvl: newLvl, exp: newExp });
    }
  } catch (dbError) {
    console.error("[DB] Error updating user EXP:", dbError);
  }
}

export function registerSocketHandlers(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_default_secret");
        const user = await db("users").where({ user_id: decoded.userId }).first();
        if (user) {
          socket.userId = user.user_id;
        }
      } catch (err) {
        console.log(`Socket Auth Error: ${err.message}`);
      }
    }
    next();
  });

  io.on("connection", (socket) => {
    socket.emit("ready");
    console.log(`클라이언트 연결: ${socket.id}`);

    const userSpecial = {};

    socket.on("chat message", async ({ msgPayload = {}, chatLog }) => {
      const text = msgPayload.text ?? "";
      const mode = msgPayload.mode ?? "basic";
      const userNote = msgPayload.userNote ?? "";
      const conversationId = msgPayload.conversationId;

      let dbGeneratedId = null; 

      if (socket.userId && conversationId && text) {
        try {
          const [id] = await db("chats").insert({ 
            user_id: socket.userId,
            conversation_id: conversationId,
            sender: "user",
            message: text,
          }).returning('id');
          dbGeneratedId = id; 
          console.log(`[DB] User message saved for user: ${socket.userId}, conversation: ${conversationId}, ID: ${dbGeneratedId}`);
        } catch (error) {
          console.error("[DB] Error saving user message:", error);
        }
      }

      if (!userSpecial[socket.id]) userSpecial[socket.id] = {};
      userSpecial[socket.id].mode = mode;
      userSpecial[socket.id].userNote = userNote;

      const success = await callGemini(socket, chatLog, conversationId, dbGeneratedId);

      if (success) {
        await grantExp(socket, socket.userId, EXP_REWARDS.CHAT);
      }
    });

    socket.on("edit message", async ({ messageId, newContent, conversationId }) => {
      if (!socket.userId || !conversationId) return;
      try {
        const updatedRows = await db("chats").where({ id: messageId, user_id: socket.userId }).update({ message: newContent });
        if (updatedRows === 0) {
          console.warn(`[DB] Edit failed: Message ${messageId} not found or not owned by user ${socket.userId}`);
          return;
        }
        const allMessages = await db("chats").where({ conversation_id: conversationId }).orderBy("created_at", "asc");
        const editedMessageIndex = allMessages.findIndex((m) => m.id === messageId);
        if (editedMessageIndex === -1) {
          console.error(`[Logic Error] Edited message ${messageId} not found in history after DB update.`);
          return;
        }
        const historyForAI = allMessages.slice(0, editedMessageIndex + 1).map((msg) => ({ sender: msg.sender, content: msg.message }));
        await callGemini(socket, historyForAI, conversationId, messageId); 
      } catch (error) {
        console.error(`[DB] Error during message edit for message ${messageId}:`, error);
        socket.emit("chat message", { message: "메시지 수정 중 오류가 발생했습니다." });
      }
    });

    socket.on("make diagram", async (payload, callback) => {
      if (!genAI) {
        console.error("Gemini client is not initialized. Check your API keys.");
        if (callback) { callback({ error: "AI Service not configured." }); }
        return;
      }
      const { chatLog, diagramState } = payload;
      const finalDiagramPrompt = diagramPrompt
        .replace("__CHAT_LOG__", JSON.stringify(chatLog, null, 2))
        .replace(
          "__NODES__",
          JSON.stringify(
            (diagramState?.nodes || []).map((n) => n.data.label),
            null,
            2
          )
        );

      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", generationConfig: { responseMimeType: "application/json" } });
        const result = await model.generateContent(finalDiagramPrompt);
        const reply = result.response.text();
        console.log(`Gemini Diagram Response [${socket.id}]:`, reply);
        try {
          const newDiagram = JSON.parse(reply);
          if (callback) { callback(newDiagram); }
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          if (callback) { callback({ error: "JSON parsing error", details: parseError.message }); }
        }
      } catch (err) {
        console.error("Gemini Diagram Error:", err);
        if (callback) { callback({ error: "AI Diagram Error", details: err.message }); }
      }
    });

    socket.on("load latest chat", async ({ conversationId }) => {
      if (socket.userId && conversationId) {
        try {
          const chatHistory = await db("chats").where({ conversation_id: conversationId, user_id: socket.userId }).orderBy("created_at", "asc");
          const formattedHistory = chatHistory.map((msg) => ({ id: msg.id, content: msg.message, sender: msg.sender }));
          socket.emit("chat history loaded", formattedHistory);
        } catch (error) {
          console.error("[DB] Error loading chat history:", error);
          socket.emit("chat history error", "Failed to load chat history.");
        }
      } else {
        socket.emit("chat history loaded", []);
      }
    });

    socket.on("reset chat", async () => {
      console.log(`'reset chat' request from ${socket.id}`);
      if (socket.userId) {
        try {
          await db("chats").where({ user_id: socket.userId }).del();
          console.log(`[DB] Reset data for user: ${socket.userId}`);
        } catch (error) {
          console.error(
            `[DB] Error resetting data for user: ${socket.userId}`,
            error
          );
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`클라이언트 연결 해제: ${socket.id}`);
    });
  });
}