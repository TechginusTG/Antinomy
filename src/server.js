// src/server.js

const express = require("express");
const path = require("path"); // 파일 경로를 다루기 위한 Node.js 내장 모듈
const http = require("http"); // HTTP 서버를 만들기 위한 Node.js 내장 모듈
const socketIo = require("socket.io"); // Socket.IO를 사용하기 위한 모듈

const app = express();
const server = http.createServer(app); // Express 앱을 HTTP 서버로 래핑
const PORT = process.env.PORT || 3000; // 환경 변수에 PORT가 설정되어 있으면 사용, 없으면 3000번 포트 사용const io = socketIo(http.createServer(app)); // Express 앱을 HTTP 서버로 래핑하고 Socket.IO를 초기화
const io = socketIo(server); // Express 앱을 HTTP 서버로 래핑하고 Socket.IO를 초기화

//src/public 폴더를 정적 파일 제공 폴더로 지정
app.use(express.static(path.join(__dirname, "public")));

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
	console.log("클라이언트가 연결됨:", socket.id);

	socket.on("chat message", (msg) => {
		// 받은 메시지를 모든 클라이언트에게 전송
		io.emit("chat message", msg);
	});

	socket.on("disconnect", () => {
		console.log("클라이언트 연결 해제:", socket.id);
	});
});
// --- 서버 시작 ---

app.listen(PORT, () => {
	console.log(`✨ Server is running on http://localhost:${PORT}`);
	console.log(`정적 파일은 ${path.join(__dirname, "public")}에서 제공됩니다.`);
	console.log(`뷰 파일은 ${path.join(__dirname, "views")}에 있습니다.`);
});
