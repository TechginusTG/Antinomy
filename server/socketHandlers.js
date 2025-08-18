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
5. Detect the language used by the user and respond in the same language.`;

export function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`클라이언트 연결: ${socket.id}`);

    socket.on("chat message", async (msg) => {
      console.log(`메시지 수신 [${socket.id}]:`, msg);

      if (!sessions[socket.id]) {
        const special = userSpecial[socket.id] || [];
        const specialString = Array.isArray(special)
          ? special.join(", ")
          : special.toString();
        sessions[socket.id] = [
          {
            role: "system",
            content: `${systemPrompt}\n\nThis user has the following traits: ${specialString}. When you answer, you should be care these properties.`,
          },
        ];
      }

      sessions[socket.id].push({ role: "user", content: msg });

      try {
        const res = await openai.chat.completions.create({
          model: "gpt-5",
          messages: sessions[socket.id],
        });

        const reply = res.choices[0].message.content;
        sessions[socket.id].push({ role: "assistant", content: reply });
        console.log(`GPT 응답 [${socket.id}]:`, reply);
        socket.emit("chat message", reply);
      } catch (err) {
        console.error("GPT 에러:", err);
        socket.emit("chat message", "GPT 고장 💀");
      }
    });

    socket.on("make diagram", async (payload) => {
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

        Your task is to output a new diagram structure in a single, minified JSON object format.

        **Layout Rules:**
        - **Hierarchical & Sequential Structure:** Identify main topics and sub-topics from the conversation. Arrange nodes in a top-down hierarchy.
            - Place broad, high-level topics higher up.
            - Position related, more specific sub-topics below their parent.
            - **If sub-topics under the same parent have a clear sequence (like steps in a process or a timeline), arrange them sequentially (e.g., top-to-bottom) to show the order.**
            - The overall layout should visually represent both inclusion and sequential relationships.
        - **Avoid Overlap:** When calculating the 'position' for each node, you MUST consider that the node's size depends on the length of its text label. Arrange the nodes so they are spaciously distributed and DO NOT overlap.
        - **Readability:** Ensure there is sufficient distance between all nodes for a clear and readable layout.

        **Output Format:**
        - The JSON object must have two keys: "nodes" and "edges".
        - "nodes" should be an array of objects, each with "id", "type" (use 'custom'), "position", and "data" ({ "label": "..." }).
        - "edges" should be an array of objects, each with "id", "source" (source node id), and "target" (target node id).
        Make sure the node and edge IDs are unique strings.
        Do not include any explanations, comments, or any text outside of the single JSON object.
        Example response: {"nodes":[{"id":"1","type":"custom","position":{"x":100,"y":100},"data":{"label":"Main Idea"}}],"edges":[]}
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
          socket.emit("diagram created", newDiagram);
        } catch (parseError) {
          console.error("JSON parsing error:", parseError);
          socket.emit(
            "chat message",
            "다이어그램 생성에 실패했어요. AI가 올바른 형식으로 응답하지 않았습니다."
          );
        }
      } catch (err) {
        console.error("GPT Diagram Error:", err);
        socket.emit(
          "chat message",
          "다이어그램 생성 중 오류가 발생했습니다. 💀"
        );
      }
    });

    socket.on("disconnect", () => {
      console.log(`클라이언트 연결 해제: ${socket.id}`);
      delete sessions[socket.id];
      delete userSpecial[socket.id];
    });
  });
}
