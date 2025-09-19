import { getAiClient, isProviderAvailable } from "./aiClient.js";
import { systemPrompt } from "./prompt/systemPrompt.js";
import { recommendPrompt } from "./prompt/recommendPrompt.js";
import { modes as prompts } from "./prompt/modes.js";
import { diagramPrompt } from "./prompt/diagramPrompt.js";
import db from "./db.js";
import jwt from "jsonwebtoken";
import pako from "pako";

const EXP_REWARDS = {
  CHAT: 10,
};

const userSpecial = {}; 

async function handleAiResponse(socket, reply, conversationId, userMessageDbId = null, aiMessageIdToUpdate = null) {
  const saveAiMessage = async (message) => {
    if (!conversationId || !message) return null;
    try {
      if (aiMessageIdToUpdate) {
        await db("chats").where({ id: aiMessageIdToUpdate }).update({ message: message });
        console.log(`[DB] AI message updated for id: ${aiMessageIdToUpdate}`);
        const updatedMessage = await db("chats").where({ id: aiMessageIdToUpdate }).first();
        return { id: updatedMessage.id, content: updatedMessage.message, sender: 'ai' };
      } else {
        const [newId] = await db("chats").insert({
          user_id: null, 
          conversation_id: conversationId,
          sender: "ai",
          message: message,
        }).returning('id');
        console.log(`[DB] AI message saved for conversation: ${conversationId}`);
        return { id: newId.id, content: message, sender: 'ai' };
      }
    } catch (error) {
      console.error("[DB] Error saving/updating AI message:", error);
      return null;
    }
  };

  try {
    const parsedReply = JSON.parse(reply);
    const chatMessage = parsedReply.chat_response || reply;
    const aiMessage = await saveAiMessage(chatMessage);

    if (aiMessage) {
      socket.emit("chat message", { aiMessage, isEdit: !!aiMessageIdToUpdate });
    }

    if (parsedReply.recommendations) {
      socket.emit("new_recommendations", parsedReply.recommendations);
      console.log(`AI Response (with recommendations) [${socket.id}]:`, parsedReply);
    } else {
        console.log(`AI Response [${socket.id}]:`, reply);
    }
  } catch (parseError) {
    const aiMessage = await saveAiMessage(reply);
     if (aiMessage) {
      socket.emit("chat message", { aiMessage, isEdit: !!aiMessageIdToUpdate });
    }
    console.log(`AI Response [${socket.id}]:`, reply);
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

function convertToApiHistory(chatLog, provider, socketId, diagramData = null) {
  const system = buildSystemPrompt(socketId);
  const history = [];

  if (provider === 'gemini') {
    history.push({ role: "user", parts: [{ text: `Please follow these instructions for our entire conversation: ${system}` }] });
    history.push({ role: "model", parts: [{ text: "Understood. I will follow all instructions." }] });
    chatLog.forEach(msg => {
      if (!msg.content) return;
      history.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    });
  } else {
    history.push({ role: "system", content: system });
    chatLog.forEach(msg => {
      if (!msg.content) return;
      history.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    });
  }

  if (diagramData && history.length > 0) {
    const lastMessage = history[history.length - 1];
    if (lastMessage.role === 'user') {
      const diagramText = `[The user has attached the following diagram to this message:\n${JSON.stringify(diagramData, null, 2)}\n]\n\n`;
      if (provider === 'gemini') {
        lastMessage.parts[0].text = diagramText + lastMessage.parts[0].text;
      } else {
        lastMessage.content = diagramText + lastMessage.content;
      }
    }
  }

  return history;
}

async function callAiModel(socket, chatLog, conversationId, userMessageDbId = null, aiMessageIdToUpdate = null, diagramData = null, provider = 'gemini') {
  const client = getAiClient(provider);
  if (!client) {
    console.error(`${provider} client is not initialized. Check your API keys.`);
    socket.emit("chat message", { message: `AI 서비스(${provider})가 설정되지 않았습니다. 💀` });
    return false;
  }

  try {
    let reply = "";
    const history = convertToApiHistory(chatLog, provider, socket.id, diagramData);

    if (provider === 'gemini') {
      const model = client.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      if (history.length > 0 && history[history.length - 1].role === 'model') {
        history.push({ role: "user", parts: [{ text: "..." }] });
      }
      const lastMessage = history.pop();
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastMessage.parts[0].text);
      reply = result.response.text();
    } else {
      const result = await client.chat.completions.create({
        messages: history,
        model: "llama-3.1-8b-instant",
      });
      reply = result.choices[0].message.content;
    }

    await handleAiResponse(socket, reply, conversationId, userMessageDbId, aiMessageIdToUpdate);
    return true;
  } catch (err) {
    console.error(`${provider} Error:`, err);
    socket.emit("chat message", { message: `AI 서비스(${provider}) 호출에 실패했습니다. 💀` });
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

    const userSpecial = {};

    socket.on("chat message", async ({ msgPayload = {}, chatLog }) => {
      const text = msgPayload.text ?? "";
      const mode = msgPayload.mode ?? "basic";
      const userNote = msgPayload.userNote ?? "";
      const conversationId = msgPayload.conversationId;
      const attachDiagramFlag = msgPayload.options?.attachDiagram;
      const provider = msgPayload.aiProvider || 'gemini';

      let diagramData = null;
      let dbGeneratedId = null;

      if (attachDiagramFlag && socket.userId && conversationId) {
        try {
          const diagramRecord = await db("diagrams")
            .where({ user_id: socket.userId, chat_room_id: conversationId })
            .first();
          if (diagramRecord && diagramRecord.diagram_data) {
            const safeEncodedData = diagramRecord.diagram_data;
            let base64 = safeEncodedData.replace(/-/g, "+").replace(/_/g, "/");
            while (base64.length % 4) {
              base64 += "=";
            }
            const decodedData = atob(base64);
            const len = decodedData.length;
            const compressed = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              compressed[i] = decodedData.charCodeAt(i);
            }
            const jsonString = pako.inflate(compressed, { to: "string" });
            diagramData = JSON.parse(jsonString);
          }
        } catch (error) {
          console.error("[DB] Error reading diagram:", error);
        }
      }

      if (socket.userId && conversationId && text) {
        try {
          const [idObject] = await db("chats")
            .insert({
              user_id: socket.userId,
              conversation_id: conversationId,
              sender: "user",
              message: text,
            })
            .returning("id");
          dbGeneratedId = idObject.id;
          console.log(
            `[DB] User message saved for user: ${socket.userId}, conversation: ${conversationId}, ID: ${dbGeneratedId}`
          );
        } catch (error) {
          console.error("[DB] Error saving user message:", error); 
        }
      }

      if (!userSpecial[socket.id]) userSpecial[socket.id] = {};
      userSpecial[socket.id].mode = mode;
      userSpecial[socket.id].userNote = userNote;

      const success = await callAiModel(
        socket,
        chatLog,
        conversationId,
        dbGeneratedId,
        null,
        diagramData,
        provider
      );

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

        let aiMessageToUpdate = null;
        if (editedMessageIndex > -1 && editedMessageIndex + 1 < allMessages.length) {
            const nextMessage = allMessages[editedMessageIndex + 1];
            if (nextMessage.sender === 'ai') {
                aiMessageToUpdate = nextMessage;
            }
        }
        const aiMessageIdToUpdate = aiMessageToUpdate ? aiMessageToUpdate.id : null;

        const historyForAI = allMessages.slice(0, editedMessageIndex + 1).map((msg) => ({ sender: msg.sender, content: msg.message }));
        
        await callAiModel(socket, historyForAI, conversationId, messageId, aiMessageIdToUpdate, null, 'gemini'); 
      } catch (error) {
        console.error(`[DB] Error during message edit for message ${messageId}:`, error);
        socket.emit("chat message", { message: "메시지 수정 중 오류가 발생했습니다." });
      }
    });

    socket.on("delete msg", async ({ messageId, conversationId }) => {
      if (!socket.userId || !conversationId || !messageId) return;

      try {
        const messageToDelete = await db("chats")
          .where({ id: messageId, conversation_id: conversationId })
          .first();

        if (!messageToDelete || messageToDelete.user_id !== socket.userId) {
          console.warn(`[Auth] User ${socket.userId} attempted to delete unauthorized or non-existent message ${messageId}`);
          socket.emit("delete-error", { message: "You can only delete your own messages." });
          return;
        }

        const deletedCount = await db("chats")
          .where({ conversation_id: conversationId })
          .andWhere("created_at", ">=", messageToDelete.created_at)
          .del();

        console.log(`[DB] User ${socket.userId} deleted ${deletedCount} messages from conversation ${conversationId} starting from message ${messageId}`);

        socket.emit("msg deleted", { messageId });

      } catch (error) {
        console.error(`[DB] Error during message deletion for message ${messageId}:`, error);
        socket.emit("delete-error", { message: "An error occurred while deleting messages." });
      }
    });

    socket.on("make diagram", async (payload, callback) => {
      const client = getAiClient('gemini');
      if (!client) {
        console.error("Gemini client for diagrams is not initialized. Check your API keys.");
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
        const model = client.getGenerativeModel({ model: "gemini-1.5-flash-latest", generationConfig: { responseMimeType: "application/json" } });
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
          const room = await db("chat_rooms").where({ id: conversationId, user_id: socket.userId }).first();
          
          if (!room) {
            console.warn(`[Auth] User ${socket.userId} attempted to access unauthorized chat room ${conversationId}`);
            socket.emit("chat history error", "Unauthorized access to chat room.");
            return;
          }
          
          const chatHistory = await db("chats").where({ conversation_id: conversationId }).orderBy("created_at", "asc");
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
    });
  });
}