import openai from "./openaiClient.js";
import { systemPrompt } from "./prompt/systemPrompt.js";
import { recommendPrompt } from "./prompt/recommendPrompt.js";
import { modes as prompts } from "./prompt/modes.js";
import { diagramPrompt } from "./prompt/diagramPrompt.js";
import db from "./db.js";
import jwt from "jsonwebtoken";

const sessions = {};
const userSpecial = {};

function handleOpenAIResponse(socket, reply, conversationId) {
  const saveAiMessage = async (message) => {
    if (socket.userId && conversationId && message) {
      try {
        await db('chats').insert({
          user_id: socket.userId,
          conversation_id: conversationId,
          sender: 'ai',
          message: message,
        });
        console.log(`[DB] AI message saved for user: ${socket.userId}, conversation: ${conversationId}`);
      } catch (error) {
        console.error('[DB] Error saving AI message:', error);
      }
    }
  };

  try {
    const parsedReply = JSON.parse(reply);
    if (parsedReply.chat_response && parsedReply.recommendations) {
      const chatMessage = parsedReply.chat_response;
      saveAiMessage(chatMessage);
      sessions[socket.id].push({ role: "assistant", content: chatMessage });
      socket.emit("chat message", { message: chatMessage });
      socket.emit("new_recommendations", parsedReply.recommendations);
      console.log(`GPT 응답 (추천 포함) [${socket.id}]:`, parsedReply);
    } else {
      throw new Error("Invalid JSON format for recommendations");
    }
  } catch (parseError) {
    saveAiMessage(reply);
    sessions[socket.id].push({ role: "assistant", content: reply });
    console.log(`GPT 응답 [${socket.id}]:`, reply);
    socket.emit("chat message", { message: reply });
  }
}

// Helper to build the system prompt
function buildSystemPrompt(socketId) {
  const { 
    mode = "basic", 
    userNote = "", 
  } = userSpecial[socketId] || {};
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

// Helper to build the session object based on user data and chat history
function buildSession(socketId, chatHistory, newText = null) {
  const session = [
    {
      role: "system",
      content: buildSystemPrompt(socketId),
    },
  ];

  chatHistory.forEach((msg) => {
    session.push({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content,
    });
  });

  if (newText) {
    session.push({ role: "user", content: newText });
  }

  return session;
}

// Helper to call OpenAI and handle the response
async function callOpenAI(socket, session, conversationId) {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: session,
    });
    const reply = res.choices[0].message.content;
    handleOpenAIResponse(socket, reply, conversationId);
  } catch (err) {
    console.error("GPT 에러:", err);
    socket.emit("chat message", { message: "GPT 고장 💀" });
  }
}

export function registerSocketHandlers(io) {
  // Middleware for socket authentication
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
        // The token payload has the string id, we need the integer user_id for our foreign key
        const user = await db('users').where({ id: decoded.userId }).first();

        if (user) {
          socket.userId = user.user_id; // Attach the integer PK to the socket
        }
      } catch (err) {
        // Ignore invalid tokens, treat as guest
        console.log(`Socket Auth Error: ${err.message}`);
      }
    }
    next();
  });

  io.on("connection", (socket) => {
    console.log(`클라이언트 연결: ${socket.id}`);

    socket.on("chat message", async ({ msgPayload = {}, chatLog }) => {
      console.log(`메시지 수신 [${socket.id}]:`, { msgPayload, chatLog });

      const text = msgPayload.text ?? "";
      const mode = msgPayload.mode ?? "basic";
      const userNote = msgPayload.userNote ?? "";
      const conversationId = msgPayload.conversationId;

      if (socket.userId && conversationId && text) {
        try {
          await db('chats').insert({
            user_id: socket.userId,
            conversation_id: conversationId,
            sender: 'user',
            message: text,
          });
          console.log(`[DB] User message saved for user: ${socket.userId}, conversation: ${conversationId}`);
        } catch (error) {
          console.error('[DB] Error saving user message:', error);
        }
      }

      // Store or update user's mode and initialize if not present
      if (!userSpecial[socket.id]) userSpecial[socket.id] = {};
      userSpecial[socket.id].mode = mode;
      userSpecial[socket.id].userNote = userNote;

      sessions[socket.id] = buildSession(socket.id, chatLog, text);

      // Call the OpenAI API with the constructed session
      await callOpenAI(socket, sessions[socket.id], conversationId);
    });

    socket.on("load chat history", (chatHistory) => {
      console.log(`'load chat history' request from ${socket.id}`);
      sessions[socket.id] = buildSession(socket.id, chatHistory);
      console.log(
        `Session for ${socket.id} has been replaced with loaded history.`
      );
    });

    socket.on("resubmit chat", async (chatHistory) => {
      console.log(`'resubmit chat' request from ${socket.id}`);
      const session = buildSession(socket.id, chatHistory);
      sessions[socket.id] = session;
      await callOpenAI(socket, session);
    });

    socket.on("make diagram", async (payload, callback) => {
      console.log(`'make diagram' request from ${socket.id}`);
      const { chatLog, diagramState } = payload;

      const finalDiagramPrompt = diagramPrompt
        .replace("__CHAT_LOG__", JSON.stringify(chatLog, null, 2))
        .replace(
          "__NODES__",
          JSON.stringify(
            diagramState.nodes.map((n) => n.data.label),
            null,
            2
          )
        );

      try {
        const res = await openai.chat.completions.create({
          model: "gpt-5",
          messages: [{ role: "user", content: finalDiagramPrompt }],
          response_format: { type: "json_object" },
        });

        const reply = res.choices[0].message.content;
        console.log(`GPT Diagram Response [${socket.id}]:`, reply);

        try {
          const newDiagram = JSON.parse(reply);
          if (callback) {
            callback(newDiagram);
          }
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          if (callback) {
            callback({
              error: "JSON parsing error",
              details: parseError.message,
            });
          }
        }
      } catch (err) {
        console.error("GPT Diagram Error:", err);
        if (callback) {
          callback({ error: "GPT Diagram Error", details: err.message });
        }
      }
    });

    socket.on("reset chat", () => {
      console.log(`'reset chat' request from ${socket.id}`);
      delete sessions[socket.id];
      console.log(`Session for ${socket.id} has been reset.`);
    });

    socket.on("load latest chat", async ({ conversationId }) => {
      console.log(`'load latest chat' request from ${socket.id} for conversation: ${conversationId}`);
      if (socket.userId && conversationId) {
        try {
          const chatHistory = await db('chats')
            .where({ conversation_id: conversationId, user_id: socket.userId })
            .orderBy('created_at', 'asc');

          const formattedHistory = chatHistory.map(msg => ({
            id: msg.id,
            content: msg.message,
            sender: msg.sender,
          }));

          socket.emit("chat history loaded", formattedHistory);
          console.log(`[DB] Sent ${formattedHistory.length} messages for user: ${socket.userId}, conversation: ${conversationId}`);
        } catch (error) {
          console.error('[DB] Error loading chat history:', error);
          socket.emit("chat history error", "Failed to load chat history.");
        }
      } else {
        socket.emit("chat history loaded", []);
      }
    });

    socket.on("disconnect", () => {
      console.log(`클라이언트 연결 해제: ${socket.id}`);
      delete sessions[socket.id];
      delete userSpecial[socket.id];
    });
  });
}
