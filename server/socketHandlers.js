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

// Define prompts in a single object for clarity and maintainability.
const prompts = {
  worry: `You are a compassionate listener and empathetic counselor. Prioritize active listening, validating feelings, and offering emotional support. Use gentle, encouraging language and reflective statements.
Always respond in polite, formal Korean (존댓말).
- **Proactive Recommendations:** After several turns of conversation, when you have a good understanding of the user's interests or a topic seems to be concluding, you MUST format your response as a single minified JSON object. This JSON object should contain two keys: "chat_response" (your normal chat message as a string) and "recommendations" (an array of 2-3 new, related topics or questions you suggest for the user). Otherwise, respond with a normal string.`,
  solution: `You are an analytical problem-solving assistant. Focus on clarifying details, identifying root causes, and proposing practical, step-by-step solutions. Ask focused questions and provide actionable recommendations.
Always respond in polite, formal Korean (존댓말).
- **Proactive Recommendations:** After several turns of conversation, when you have a good understanding of the user\'s interests or a topic seems to be concluding, you MUST format your response as a single minified JSON object. This JSON object should contain two keys: "chat_response" (your normal chat message as a string) and "recommendations" (an array of 2-3 new, related topics or questions you suggest for the user). Otherwise, respond with a normal string.`,
  basic: `You are an AI counselor that balances empathy with practical problem-solving.
- **Empathetic Listening:** Start by acknowledging the user's feelings and validating their concerns with gentle, supportive language.
- **Analytical Problem-Solving:** After showing empathy, transition to a problem-solving approach. Ask targeted questions to clarify the issue, identify root causes, and collaboratively develop actionable, step-by-step solutions.
- **Tone:** Maintain a polite, formal, and encouraging tone throughout the conversation.
Always respond in polite, formal Korean (존댓말).
- **Proactive Recommendations:** After several turns of conversation, when you have a good understanding of the user's interests or a topic seems to be concluding, you MUST format your response as a single minified JSON object. This JSON object should contain two keys: "chat_response" (your normal chat message as a string) and "recommendations" (an array of 2-3 new, related topics or questions you suggest for the user). Otherwise, respond with a normal string.`
};

function handleOpenAIResponse(socket, reply) {
  try {
    const parsedReply = JSON.parse(reply);
    if (parsedReply.chat_response && parsedReply.recommendations) {
      const chatMessage = parsedReply.chat_response;
      sessions[socket.id].push({ role: 'assistant', content: chatMessage });
      socket.emit('chat message', { message: chatMessage });
      socket.emit('new_recommendations', parsedReply.recommendations);
      console.log(`GPT 응답 (추천 포함) [${socket.id}]:`, parsedReply);
    } else {
      throw new Error("Invalid JSON format for recommendations");
    }
  } catch (parseError) {
    sessions[socket.id].push({ role: 'assistant', content: reply });
    console.log(`GPT 응답 [${socket.id}]:`, reply);
    socket.emit('chat message', { message: reply });
  }
}

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`클라이언트 연결: ${socket.id}`);

    socket.on("chat message", async ({ msgPayload = {}, chatLog }) => {
      console.log(`메시지 수신 [${socket.id}]:`, { msgPayload, chatLog });

      const text = msgPayload.text || '';
      const mode = msgPayload.mode || userSpecial[socket.id]?.mode || 'basic';

      // Store chosen mode per socket for future reference (e.g., load history/resubmit)
      if (!userSpecial[socket.id]) userSpecial[socket.id] = {};
      userSpecial[socket.id].mode = mode;

      // Select system prompt based on mode, defaulting to basic
      const selectedSystemPrompt = prompts[mode] || prompts.basic;

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

      // --- TEMPORARY TEST CODE START ---
      const testPrompt = `
        You are a helpful assistant. The user has sent the following message: "${text}".
        Your task is to respond to the user's message and also provide a list of recommended next questions.
        You MUST format your response as a single minified JSON object with two keys:
        - "chat_response": A string containing your direct reply to the user's message.
        - "recommendations": An array of 3 strings, where each string is a new, interesting question related to the user's message.
      `;
      const testSession = [{ role: 'user', content: testPrompt }];
      // --- TEMPORARY TEST CODE END ---

      try {
        const res = await openai.chat.completions.create({
          model: 'gpt-5',
          messages: testSession, // Using testSession instead of sessions[socket.id]
        });

        const reply = res.choices[0].message.content;
        handleOpenAIResponse(socket, reply);
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
      
      // Select system prompt based on stored mode, defaulting to basic
      const storedMode = userSpecial[socket.id]?.mode || 'basic';
      const selectedSystemPrompt = prompts[storedMode] || prompts.basic;

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
      
      // Use stored mode when resubmitting, defaulting to basic
      const storedMode = userSpecial[socket.id]?.mode || 'basic';
      const selectedSystemPrompt = prompts[storedMode] || prompts.basic;

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
        handleOpenAIResponse(socket, reply);
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