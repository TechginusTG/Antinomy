import openai from "./openaiClient.js";

const sessions = {};
const userSpecial = {};
const systemPrompt = `Your name is "Antinomy".
You are a problem-solving guide AI.

Conversation Rules:
1. The user's first message is the main problem they want to solve.
2. Each problem-solving cycle has 3 phases:
   a. Problem Exploration Phase
      - Ask 1 focused question at a time to clarify the problem.
      - Ask 3 questions sequentially, waiting for user answer after each.
      - After the 3rd question, summarize insights before moving to solution phase.
   b. Solution Generation Phase
      - Ask 1 question at a time to explore possible solutions.
      - Ask 3 questions sequentially, waiting for user answer after each.
      - After the 3rd question, summarize proposed solutions.
   c. Conclusion Phase
      - Help the user summarize the discussion into 3 key points.
      - Ask if there is another problem. If yes, start a new cycle.
3. Always proceed step by step, never skip questions.
4. Each answer from the AI should include **only one question or prompt** until the user responds.
5. Always respond in polite, formal Korean (존댓말).

**Formatting Rule:**
- Please format your responses using Markdown.
- Use line breaks, lists, bolding, and other formatting to improve readability and structure.
- For example, use bullet points (-) for lists.`;

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`클라이언트 연결: ${socket.id}`);

    socket.on("chat message", async ({ msgPayload = {}, chatLog }) => {
      console.log(`메시지 수신 [${socket.id}]:`, { msgPayload, chatLog });

      const text = msgPayload.text || '';
      const mode = msgPayload.mode || userSpecial[socket.id]?.mode || 'worry';

      // Store chosen mode per socket for future reference (e.g., load history/resubmit)
      if (!userSpecial[socket.id]) userSpecial[socket.id] = {};
      userSpecial[socket.id].mode = mode;

      // Select system prompt based on mode
      const worryPrompt = `You are a compassionate listener and empathetic counselor. Prioritize active listening, validating feelings, and offering emotional support. Use gentle, encouraging language and reflective statements.
Always respond in polite, formal Korean (존댓말).`;
      const solutionPrompt = `You are an analytical problem-solving assistant. Focus on clarifying details, identifying root causes, and proposing practical, step-by-step solutions. Ask focused questions and provide actionable recommendations.
Always respond in polite, formal Korean (존댓말).`;

      const selectedSystemPrompt = mode === 'solution' ? solutionPrompt : worryPrompt;

      const special = userSpecial[socket.id].special || []; // Access .special property
      const specialString = Array.isArray(special) ? special.join(', ') : special.toString();

      const newSession = [
        {
          role: 'system',
          content: `${selectedSystemPrompt}\n\nThis user has the following traits: ${specialString}. When you answer, you should be care these properties.`, 
        },
      ];

      chatLog.forEach((msg) => {
        newSession.push({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.content });
      });

      newSession.push({ role: 'user', content: text });

      sessions[socket.id] = newSession;

      try {
        const res = await openai.chat.completions.create({
          model: 'gpt-5',
          messages: sessions[socket.id],
        });

        const reply = res.choices[0].message.content;
        sessions[socket.id].push({ role: 'assistant', content: reply });
        console.log(`GPT 응답 [${socket.id}]:`, reply);
        socket.emit('chat message', { message: reply });
      } catch (err) {
        console.error('GPT 에러:', err);
        socket.emit('chat message', { message: 'GPT 고장 💀' });
      }
    });

    socket.on("load chat history", (chatHistory) => {
      console.log(`'load chat history' request from ${socket.id}`);
      const special = userSpecial[socket.id]?.special || [];
      const specialString = Array.isArray(special)
        ? special.join(", ")
        : special.toString();
      
      // Select system prompt based on stored mode (default worry)
      const storedMode = userSpecial[socket.id]?.mode || 'worry';
      const worryPrompt = `You are a compassionate listener and empathetic counselor. Prioritize active listening, validating feelings, and offering emotional support. Use gentle, encouraging language and reflective statements.\nAlways respond in polite, formal Korean (존댓말).`;
      const solutionPrompt = `You are an analytical problem-solving assistant. Focus on clarifying details, identifying root causes, and proposing practical, step-by-step solutions. Ask focused questions and provide actionable recommendations.\nAlways respond in polite, formal Korean (존댓말).`;
      const selectedSystemPrompt = storedMode === 'solution' ? solutionPrompt : worryPrompt;

      const newSession = [
        {
          role: 'system',
          content: `${selectedSystemPrompt}\n\nThis user has the following traits: ${specialString}. When you answer, you should be care these properties.`, 
        },
      ];

      chatHistory.forEach((msg) => {
        newSession.push({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.content });
      });

      sessions[socket.id] = newSession;
      console.log(`Session for ${socket.id} has been replaced with loaded history.`);
    });

    socket.on("resubmit chat", async (chatHistory) => {
      console.log(`'resubmit chat' request from ${socket.id}`);
      const special = userSpecial[socket.id]?.special || [];
      const specialString = Array.isArray(special)
        ? special.join(", ")
        : special.toString();
      // Use stored mode when resubmitting
      const storedMode = userSpecial[socket.id]?.mode || 'worry';
      const worryPrompt = `You are a compassionate listener and empathetic counselor. Prioritize active listening, validating feelings, and offering emotional support. Use gentle, encouraging language and reflective statements.\nAlways respond in polite, formal Korean (존댓말).`;
      const solutionPrompt = `You are an analytical problem-solving assistant. Focus on clarifying details, identifying root causes, and proposing practical, step-by-step solutions. Ask focused questions and provide actionable recommendations.\nAlways respond in polite, formal Korean (존댓말).`;
      const selectedSystemPrompt = storedMode === 'solution' ? solutionPrompt : worryPrompt;

      const newSession = [
        {
          role: 'system',
          content: `${selectedSystemPrompt}\n\nThis user has the same traits: ${specialString}. When you answer, you should be care these properties.`, 
        },
      ];

      chatHistory.forEach((msg) => {
        newSession.push({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.content });
      });

      sessions[socket.id] = newSession;

      try {
        const res = await openai.chat.completions.create({
          model: 'gpt-5',
          messages: sessions[socket.id],
        });

        const reply = res.choices[0].message.content;
        sessions[socket.id].push({ role: 'assistant', content: reply });
        console.log(`GPT 응답 [${socket.id}]:`, reply);
        socket.emit('chat message', { message: reply });
      } catch (err) {
        console.error('GPT 에러:', err);
        socket.emit('chat message', { message: 'GPT 고장 💀' });
      }
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
            callback({ error: "JSON parsing error", details: parseError.message });
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