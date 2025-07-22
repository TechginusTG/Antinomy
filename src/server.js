// src/server.js

const express = require("express");
const path = require("path"); // 파일 경로를 다루기 위한 Node.js 내장 모듈
const http = require("http"); // HTTP 서버를 만들기 위한 Node.js 내장 모듈
const socketIo = require("socket.io"); // Socket.IO를 사용하기 위한 모듈

const app = express();
const server = http.createServer(app); // Express 앱을 HTTP 서버로 래핑
const PORT = process.env.PORT || 3000; // 환경 변수에 PORT가 설정되어 있으면 사용, 없으면 3000번 포트 사용
const io = socketIo(server); // Express 앱을 HTTP 서버로 래핑하고 Socket.IO를 초기화

const OpenAI = require("openai"); // OpenAI API를 사용하기 위한 모듈
require("dotenv").config(); // .env 파일에서 환경 변수를 로드하기 위한 모듈
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY, // 환경 변수에서 OpenAI API 키를 가져옴
});

const sessions = {}; // ✅ 유저별 대화 기록
const userSpecial = {}; // ✅ 유저별 특성 저장
const systemPrompt = `We are going to have a conversation to strengthen problem-solving thinking. I will present a problem, and you will respond with a focused question and hint, step by step, to guide me toward a solution. User's FISRT chat will be biggest problem which user want to solve.`
; // 시스템 프롬프트 설정




const readline = require("readline");
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

rl.on("line", (input) => {
	// 콘솔에서 엔터로 입력받은 내용을 모든 클라이언트에게 전송
	io.emit("server-message", input);
	console.log(`모든 클라이언트에게 전송: ${input}`);
});

//src/public 폴더를 정적 파일 제공 폴더로 지정
app.use(express.static(path.join(__dirname, "public")));

// JSON 파싱 미들웨어
app.use(express.json()); // JSON 파싱 미들웨어

// 루트 경로 ('/') 요청 처리
app.get("/visited", (req, res) => {
	// src/views/index.html 파일을 클라이언트에게 전송
	// path.join()을 사용하여 OS에 관계없이 올바른 경로를 만듭니다.
	res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/", (req, res) => {
	// src/views/index.html 파일을 클라이언트에게 전송
	// path.join()을 사용하여 OS에 관계없이 올바른 경로를 만듭니다.
	res.sendFile(path.join(__dirname, "views", "firstScreen.html"));
});

app.get("/settings", (req, res) => {
	// src/views/index.html 파일을 클라이언트에게 전송
	// path.join()을 사용하여 OS에 관계없이 올바른 경로를 만듭니다.
	res.sendFile(path.join(__dirname, "views", "setting.html"));
});
app.get("/test", (req, res) => {
	// src/views/index.html 파일을 클라이언트에게 전송
	// path.join()을 사용하여 OS에 관계없이 올바른 경로를 만듭니다.
	res.sendFile(path.join(__dirname, "views", "test_test.html"));
});
app.get("/test_diagram", (req, res) => {
	// src/views/index.html 파일을 클라이언트에게 전송
	// path.join()을 사용하여 OS에 관계없이 올바른 경로를 만듭니다.
	res.sendFile(path.join(__dirname, "views", "test_diagram.html"));
});
// --- 모든 정의되지 않은 경로를 루트로 리디렉션 (추가된 코드) ---
// 이 미들웨어는 위의 app.get('/') 라우트가 처리하지 못한 모든 요청을 잡습니다.
app.use((req, res) => {
	// 이미 응답 헤더가 전송되지 않았다면 (즉, 다른 라우트나 정적 파일이 처리되지 않았다면)
	if (!res.headersSent) {
		res.redirect("/");
	}
	// 만약 이미 응답이 전송되었다면, 아무것도 하지 않고 다음 미들웨어로 넘어가지 않습니다.
	// (이 부분이 마지막 미들웨어이므로 사실상 요청 처리는 여기서 끝납니다)
});
// --- Socket.IO 이벤트 처리 ---
io.on("connection", (socket) => {


    // ✅ GPT와 대화 처리
    socket.on("chat message", async (data) => {
        const { message, history } = data;
        console.log(`메시지 수신 [${socket.id}]:`, message);

        if (!sessions[socket.id]) {
            const special = userSpecial[socket.id] || [];
            const specialString = Array.isArray(special) ? special.join(", ") : special.toString();
            
            // Start with system prompts
            const initialPrompts = [
                { role: "system", content: systemPrompt },
                {
                    role: "system",
                    content: `This user has the following traits: ${specialString}. When you answer, you should be care these properties.`,
                },
            ];

            // Combine initial prompts with history from client
            sessions[socket.id] = [...initialPrompts, ...history];

        }

        sessions[socket.id].push({ role: "user", content: message });

        try {
            const res = await openai.chat.completions.create({
                model: "gpt-4o", // 또는 gpt-4o
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

    socket.on("makdiagram", async (data) => {
        console.log(`'makdiagram' event received with data: ${data}`);

        const diagramSystemPrompt = `You are an assistant that generates Mermaid.js syntax for diagrams based on user requests. Only output the Mermaid code block. Do not include any other text or explanations. The diagram should be a 'graph TD'.`;

        try {
            const res = await openai.chat.completions.create({
                model: "gpt-4", // 또는 gpt-4o
                messages: [
                    { role: "system", content: diagramSystemPrompt },
                    { role: "user", content: data }
                ],
            });

            let reply = res.choices[0].message.content;
            console.log(`GPT Diagram raw response [${socket.id}]:`, reply);

            // Mermaid 코드 블록 추출 (```mermaid ... ``` 또는 ``` ... ```)
            const mermaidRegex = /```(?:mermaid)?\s*([\s\S]*?)\s*```/;
            const match = reply.match(mermaidRegex);

            if (match && match[1]) {
                reply = match[1].trim();
            } else {
                // 코드 블록이 없으면 전체 응답을 사용하고 앞뒤 공백 제거
                reply = reply.trim();
            }
            
            console.log(`GPT Diagram cleaned response [${socket.id}]:`, reply);
            socket.emit("diagram-update", reply);
        } catch (err) {
            console.error("GPT Diagram Error:", err);
            socket.emit("diagram-update", "graph TD\n    A[Error generating diagram]");
        }
    });

	socket.on("disconnect", () => {
		console.log("클라이언트 연결 해제:", socket.id);
		delete sessions[socket.id];
        delete userSpecial[socket.id];
	});
});
// --- 서버 시작 ---

server.listen(PORT, () => {
	console.log(`✨ Server is running on http://localhost:${PORT}`);
	console.log(`정적 파일은 ${path.join(__dirname, "public")}에서 제공됩니다.`);
	console.log(`뷰 파일은 ${path.join(__dirname, "views")}에 있습니다.`);
});
