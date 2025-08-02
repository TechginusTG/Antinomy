import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerSocketHandlers } from './socketHandlers.js';

// ESM에서 __dirname을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// CORS 설정
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'YOUR_PRODUCTION_URL' : 'http://localhost:5173',
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 'YOUR_PRODUCTION_URL' : 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(express.json());

// 프로덕션 환경에서 React 앱 서빙
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Socket.IO 이벤트 처리
registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`✨ API Server is running on http://localhost:${PORT}`);
});