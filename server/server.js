import 'dotenv/config';
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { registerSocketHandlers } from "./socketHandlers.js";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import knex from 'knex';
import knexConfig from '../knexfile.cjs';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import userRoutes from './routes/userRoutes.js';
import diagramRoutes from './routes/diagramRoutes.js';
import authenticateToken from './authenticateToken.js';

// ESM에서 __dirname을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const db = knex(knexConfig.development);

app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/diagram', diagramRoutes);
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

app.post("/api/login", async (req, res) => {
  const { id, password } = req.body;

  try {
    const user = await db('users').where({ id: id }).first();

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);

      if (isValid) {
        const token = jwt.sign({ userId: user.user_id, name: user.name }, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: '1h' });
        res.json({ success: true, token, user: { id: user.id, name: user.name, exp: user.exp, lvl: user.lvl, conversationId: user.conversation_id } });
      } else {
        res.status(401).json({ success: false, message: "아이디 또는 비밀번호가 잘못되었습니다." });
      }
    } else {
      res.status(401).json({ success: false, message: "아이디 또는 비밀번호가 잘못되었습니다." });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: '서버 에러가 발생했습니다.' });
  }
});

app.post("/api/register", async (req, res) => {
  const { id, name, password } = req.body;

  if (!id || !name || !password) {
    return res.status(400).json({success: false, message: "아이디, 사용자 이름, 비밀번호 모두를 입력해 주세요."});
  }

  try{
    const existingUser = await db('users').where({ id: id }).first();

    if (existingUser) {
      return res.status(409).json({ success: false, message: "이미 존재하는 아이디입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const conversationId = randomUUID();

    const [newUser] = await db('users').insert({
      id: id,
      name: name,
      password: hashedPassword,
      conversation_id: conversationId
    }).returning(['user_id', 'id', 'name']);

    const token = jwt.sign({ userId: newUser.user_id, name: newUser.name }, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: '1h' });

    res.status(201).json({ success: true, message: "회원가입이 완료되었습니다.", token: token });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: '서버 에러가 발생했습니다.' });
  }
});



app.post("/api/user/stats", authenticateToken, async (req, res) => {
  const { exp, lvl } = req.body;
  const userId = req.user.userId;

  if (typeof exp === 'undefined' || typeof lvl === 'undefined') {
    return res.status(400).json({ success: false, message: "exp and lvl are required." });
  }

  try {
    await db('users').where({ id: userId }).update({ exp, lvl });
    res.json({ success: true, message: "Stats updated successfully." });
  } catch (error) {
    console.error('Stats update error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating stats.' });
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

let dbStatus = {
  isConnected: false,
  message: 'Initializing...'
};

// 서버 및 DB 상태를 반환하는 엔드포인트
app.get("/api/status", (req, res) => {
  res.json({
    server: { isConnected: true },
    database: dbStatus
  });
});

const startServerAndCheckDb = () => {
  server.listen(PORT, () => {
    console.log(`✨ API Server is running on http://localhost:${PORT}`);
    
    // 서버 시작 후 비동기적으로 DB 마이그레이션 시도
    db.migrate.latest()
      .then(() => {
        console.log('Database migration successful.');
        dbStatus = { isConnected: true, message: 'Connected' };
      })
      .catch((error) => {
        console.error('Database migration failed:', error);
        dbStatus = { isConnected: false, message: 'Database connection failed' };
        console.warn('⚠️ Server started, but database connection failed.');
      });
  });
};

startServerAndCheckDb();
