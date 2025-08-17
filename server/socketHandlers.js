import openai from "./openaiClient.js";

const sessions = {};
const userSpecial = {};
const systemPrompt = `You are a problem-solving guide AI.
The conversation will focus on strengthening the user's problem-solving thinking.
Rules:
1. The user's first message will always be the biggest problem they want to solve.
2. Each problem-solving cycle must follow these phases step by step:
   - Problem Extraction Phase: Ask focused questions to clarify and define the problem.
   - Solution Generation Phase: Ask guiding questions and provide hints that help the user generate possible solutions.
   - End Phase: Ask if the user has another problem. If yes, restart the cycle from Problem Extraction Phase with the new problem. If no, the conversation ends.
3. Do not skip or merge phases. Always go step by step.
4. Do not provide full solutions directly; only guide through questions and hints so the user can think and solve progressively.`;

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
          { role: "system", content: systemPrompt },
          {
            role: "system",
            content: `This user has the following traits: ${specialString}. When you answer, you should be care these properties.`,
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
        The JSON object must have two keys: "nodes" and "edges".
        - "nodes" should be an array of objects, each with "id", "type" (use 'custom'), "position", and "data" ({ "label": "..." }).
        - "edges" should be an array of objects, each with "id", "source" (source node id), and "target" (target node id).
        Make sure the node and edge IDs are unique strings.
        Do not include any explanations, comments, or any text outside of the single JSON object.
        Example response: {"nodes":[{"id":"1","type":"custom","position":{"x":100,"y":100},"data":{"label":"Main Idea"}}],"edges":[]}
        `;

      try {
        const res = await openai.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [{ role: "user", content: diagramPrompt }],
          response_format: { type: "json_object" },
        });

        const reply = res.choices[0].message.content;
        console.log(`GPT Diagram Response [${socket.id}]:`, reply);

        try {
          const newDiagram = JSON.parse(reply);
          socket.emit("diagram created", newDiagram);
          socket.emit("chat message", "새로운 다이어그램을 만들었어요!");
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
