import openai from "./openaiClient.js";

const sessions = {};
const userSpecial = {};
const systemPrompt = `We are going to have a conversation to strengthen problem-solving thinking. I will present a problem, and you will respond with a focused question and hint, step by step, to guide me toward a solution. User's FISRT chat will be biggest problem which user want to solve.`;

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
        Nodes: ${JSON.stringify(diagramState.nodes.map(n => n.data.label), null, 2)}

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
                socket.emit("chat message", "다이어그램 생성에 실패했어요. AI가 올바른 형식으로 응답하지 않았습니다.");
            }

        } catch (err) {
            console.error("GPT Diagram Error:", err);
            socket.emit("chat message", "다이어그램 생성 중 오류가 발생했습니다. 💀");
        }
    });

    socket.on("disconnect", () => {
      console.log(`클라이언트 연결 해제: ${socket.id}`);
      delete sessions[socket.id];
      delete userSpecial[socket.id];
    });
  });
}