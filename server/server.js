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

// Canonical host 리다이렉션 미들웨어 (마이그레이션을 위해 임시 비활성화)
/*
app.use((req, res, next) => {
  const canonicalHost = 'syncro.tg-antinomy.kro.kr';
  // 'x-forwarded-host'는 프록시 환경을 위한 헤더입니다.
  const host = req.headers['x-forwarded-host'] || req.headers.host;

  if (host && host !== canonicalHost && process.env.NODE_ENV === "production") {
    // 301 리다이렉트는 "영구 이동"을 의미하며, SEO에 가장 좋습니다.
    res.redirect(301, `https://${canonicalHost}${req.originalUrl}`);
  } else {
    next();
  }
});
*/

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// CORS 설정
const allowedOrigins = [
  "https://syncro.tg-antinomy.kro.kr",
  "https://tg-antinomy.kro.kr",
  "https://tg-antinomy.p-e.kr",
  "https://syncro.tg-antinomy.p-e.kr",
  "http://localhost:5173"
];

const corsOptions = {
  origin: (origin, callback) => {
    // 개발 환경이거나 origin이 없는 경우(예: Postman) 또는 허용된 목록에 있는 경우
    if (process.env.NODE_ENV !== 'production' || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
  const buildPath = path.resolve(__dirname, "..", "dist");
  app.use(express.static(buildPath));

  app.get("/*path", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// Socket.IO 이벤트 처리
registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`✨ API Server is running on http://localhost:${PORT}`);
});
