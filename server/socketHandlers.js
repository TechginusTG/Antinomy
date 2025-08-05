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
                    model: "gpt-4o",
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

        socket.on("disconnect", () => {
            console.log(`클라이언트 연결 해제: ${socket.id}`);
            delete sessions[socket.id];
            delete userSpecial[socket.id];
        });
    });
}
