import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { registerSocketHandlers } from "./socketHandlers.js";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import knex from 'knex';
import knexConfig from '../knexfile.cjs';
import bcrypt from 'bcrypt';

// ESM에서 __dirname을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const db = knex(knexConfig.development);

// Canonical host 리다이렉션 미들웨어
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

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// CORS 설정
const allowedOrigins = [
  "https://syncro.tg-antinomy.kro.kr",
  "https://tg-antinomy.kro.kr",
  "https://tg-antinomy.p-e.kr",
  "https://syncro.tg-antinomy.p-e.kr",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    // 개발 환경이거나 origin이 없는 경우(예: Postman) 또는 허용된 목록에 있는 경우
    if (
      process.env.NODE_ENV !== "production" ||
      !origin ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

// helmet을 사용하여 보안 관련 HTTP 헤더를 설정합니다.
// Content-Security-Policy와 Cross-Origin-Embedder-Policy는
// 현재 앱과의 호환성을 위해 비활성화합니다.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

const io = new Server(server, {
  cors: corsOptions,
});

app.use(express.json());

app.post("/api/login", async (req, res) => {
  const { id, password } = req.body;

  try {
    // 1. 데이터베이스에서 사용자 찾기
    const user = await db('users').where({ id: id }).first();

    if (user) {
      // 2. 사용자가 있으면, 입력된 비밀번호와 DB의 암호화된 비밀번호 비교
      const isValid = await bcrypt.compare(password, user.password);

      if (isValid) {
        // 3. 비밀번호가 맞으면, 토큰 생성하여 전송
        const token = jwt.sign({ userId: user.id, name: user.name }, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: '1h' });
        res.json({ success: true, token });
      } else {
        // 비밀번호가 틀리면 에러 전송
        res.status(401).json({ success: false, message: "아이디 또는 비밀번호가 잘못되었습니다." });
      }
    } else {
      // 사용자가 없으면 에러 전송
      res.status(401).json({ success: false, message: "아이디 또는 비밀번호가 잘못되었습니다." });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: '서버 에러가 발생했습니다.' });
  }
});

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
