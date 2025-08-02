import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { registerSocketHandlers } from "./socketHandlers.js";

// ESM에서 __dirname을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// CORS 설정
const corsOptions = {
    origin:
        process.env.NODE_ENV === "production"
            ? "YOUR_PRODUCTION_URL"
            : "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
};

app.use(cors(corsOptions));

const io = new Server(server, {
    cors: corsOptions,
});

app.use(express.json());

// 프로덕션 환경에서 React 앱 서빙
if (process.env.NODE_ENV === "production") {
    // 클라이언트 빌드 디렉토리 경로를 수정해야 할 수 있습니다.
    const buildPath = path.join(__dirname, "..", "client", "dist");
    app.use(express.static(buildPath));

    app.get("*", (req, res) => {
        res.sendFile(path.join(buildPath, "index.html"));
    });
}

// Socket.IO 이벤트 처리
registerSocketHandlers(io);

server.listen(PORT, () => {
    console.log(`✨ API Server is running on http://localhost:${PORT}`);
});
