import openai from "./openaiClient.js";
import { systemPrompt } from "./prompt/systemPrompt.js";
import { recommendPrompt } from "./prompt/recommendPrompt.js";
import { modes as prompts } from "./prompt/modes.js";

const sessions = {};
const userSpecial = {};

function handleOpenAIResponse(socket, reply) {
  try {
    const parsedReply = JSON.parse(reply);
    if (parsedReply.chat_response && parsedReply.recommendations) {
      const chatMessage = parsedReply.chat_response;
      sessions[socket.id].push({ role: "assistant", content: chatMessage });
      socket.emit("chat message", { message: chatMessage });
      socket.emit("new_recommendations", parsedReply.recommendations);
      console.log(`GPT 응답 (추천 포함) [${socket.id}]:`, parsedReply);
    } else {
      throw new Error("Invalid JSON format for recommendations");
    }
  } catch (parseError) {
    sessions[socket.id].push({ role: "assistant", content: reply });
    console.log(`GPT 응답 [${socket.id}]:`, reply);
    socket.emit("chat message", { message: reply });
  }
}

// Helper to build the session object based on user data and chat history
function buildSession(socketId, chatHistory, newText = null) {
  const { mode = "basic", special = [] } = userSpecial[socketId] || {};
  const specialString = Array.isArray(special)
    ? special.join(", ")
    : special.toString();
  const selectedModePrompt = prompts[mode] || prompts.basic;

  // Combine all parts of the system prompt
  const finalSystemPrompt = `
    ${systemPrompt}

    ${recommendPrompt}

    MODE=${mode}:${selectedModePrompt}

    This user has the following traits: ${specialString}. When you answer, you should be care these properties.
  `;

  const session = [
    {
      role: "system",
      content: finalSystemPrompt.trim(),
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
async function callOpenAI(socket, session) {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-5",
      messages: session,
    });
    const reply = res.choices[0].message.content;
    handleOpenAIResponse(socket, reply);
  } catch (err) {
    console.error("GPT 에러:", err);
    socket.emit("chat message", { message: "GPT 고장 💀" });
  }
}

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`클라이언트 연결: ${socket.id}`);

    socket.on("chat message", async ({ msgPayload = {}, chatLog }) => {
      console.log(`메시지 수신 [${socket.id}]:`, { msgPayload, chatLog });

      const text = msgPayload.text || "";
      const mode = msgPayload.mode || "basic";

      // Store or update user's mode and initialize if not present
      if (!userSpecial[socket.id]) userSpecial[socket.id] = {};
      userSpecial[socket.id].mode = mode;

      sessions[socket.id] = buildSession(socket.id, chatLog, text);

      // Call the OpenAI API with the constructed session
      await callOpenAI(socket, sessions[socket.id]);
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

      const diagramPrompt = `
        Based on the following conversation and the current diagram state, generate an updated diagram.
        The diagram should represent the key topics and their relationships from the conversation.
        Conversation History:
        ${JSON.stringify(chatLog, null, 2)}

        Current Diagram State:
        Nodes: ${JSON.stringify(
          diagramState.nodes.map((n) => n.data.label),
          null,
          2
        )}

        Your task is to output a new diagram structure in a single, minified JSON object format. Do not calculate node positions.

        **Output Format:**
        - The JSON object must have three keys: "nodes", "edges", and "quests".
        - "nodes" should be an array of objects, each with "id", "type" (use 'custom'), and "data" ({ "label": "..." }). Do NOT include a "position" key.
        - "edges" should be an array of objects, each with "id", "source" (source node id), and "target" (target node id).
        - **Challenge Generation:** Based on the conversation, create 2-3 simple, concise challenges for the user in the '-하기' style (e.g., "문제 원인 분석하기"). These should be returned in the "quests" key as an array of strings.
        
        Make sure all IDs are unique strings.
        Do not include any explanations, comments, or any text outside of the single JSON object.
        Example response: {"nodes":[{"id":"1","type":"custom","data":{"label":"Main Idea"}}],"edges":[],"quests":["Challenge 1", "Challenge 2"]}
        `;

      try {
        const res = await openai.chat.completions.create({
          model: "gpt-5",
          messages: [{ role: "user", content: diagramPrompt }],
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

    socket.on("disconnect", () => {
      console.log(`클라이언트 연결 해제: ${socket.id}`);
      delete sessions[socket.id];
      delete userSpecial[socket.id];
    });
  });
}