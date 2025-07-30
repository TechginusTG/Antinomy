import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import OpenAI from 'openai';
import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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

/*
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sessions = {};
const userSpecial = {};
const systemPrompt = `We are going to have a conversation to strengthen problem-solving thinking. I will present a problem, and you will respond with a focused question and hint, step by step, to guide me toward a solution. User's FISRT chat will be biggest problem which user want to solve.`

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
io.on('connection', (socket) => {
  console.log(`클라이언트 연결 성공: ${socket.id}`);

  socket.on('chat message', async (msg) => {
    console.log(`메시지 수신 [${socket.id}]:`, msg);

    if (!sessions[socket.id]) {
      const special = userSpecial[socket.id] || [];
      const specialString = Array.isArray(special) ? special.join(', ') : special.toString();
      sessions[socket.id] = [
        { role: 'system', content: systemPrompt },
        {
          role: 'system',
          content: `This user has the following traits: ${specialString}. When you answer, you should be care these properties.`,
        },
      ];
    }

    sessions[socket.id].push({ role: 'user', content: msg });

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: sessions[socket.id],
      });

      const reply = res.choices[0].message.content;
      sessions[socket.id].push({ role: 'assistant', content: reply });
      console.log(`GPT 응답 [${socket.id}]:`, reply);
      socket.emit('chat message', reply);
    } catch (err) {
      console.error('GPT 에러:', err);
      socket.emit('chat message', 'GPT 고장 💀');
    }
  });

  socket.on('makdiagram', async (data) => {
    console.log(`'makdiagram' event received with data: ${data}`);

    const diagramSystemPrompt = `You are an assistant that generates Mermaid.js syntax for diagrams based on user requests. Only output the Mermaid code block. Do not include any other text or explanations. The diagram should be a 'graph TD'.`;

    try {
      const res = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: diagramSystemPrompt },
          { role: 'user', content: data },
        ],
      });

      let reply = res.choices[0].message.content;
      console.log(`GPT Diagram raw response [${socket.id}]:`, reply);

      const mermaidRegex = /```(?:mermaid)?\s*([\s\S]*?)\s*```/;
      const match = reply.match(mermaidRegex);

      if (match && match[1]) {
        reply = match[1].trim();
      } else {
        reply = reply.trim();
      }

      console.log(`GPT Diagram cleaned response [${socket.id}]:`, reply);
      socket.emit('diagram-update', reply);
    } catch (err) {
      console.error('GPT Diagram Error:', err);
      socket.emit('diagram-update', 'graph TD\n    A[Error generating diagram]');
    }
  });

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 해제:', socket.id);
    delete sessions[socket.id];
    delete userSpecial[socket.id];
  });
});
*/

server.listen(PORT, () => {
  console.log(`✨ API Server is running on http://localhost:${PORT}`);
});
