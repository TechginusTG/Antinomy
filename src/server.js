// src/server.js

const express = require('express');
const path = require('path'); // 파일 경로를 다루기 위한 Node.js 내장 모듈

const app = express();
const PORT = process.env.PORT || 3000; // 환경 변수에 PORT가 설정되어 있으면 사용, 없으면 3000번 포트 사용

// --- 미들웨어 설정 ---

// 1. 정적 파일 서비스 설정: src/public 폴더를 정적 파일 제공 폴더로 지정
// 이렇게 설정하면 브라우저에서 'http://localhost:3000/img/jojo_P.jpg' 와 같이 접근 가능
app.use(express.static(path.join(__dirname, 'public')));

// 2. 뷰 엔진 설정 (선택 사항: 여기서는 HTML 파일을 직접 전송하므로 EJS/Pug 같은 템플릿 엔진은 필요 없음)
// 하지만 만약 나중에 동적으로 HTML을 생성할 필요가 있다면 템플릿 엔진을 설정할 수 있습니다.
// 여기서는 `res.sendFile`을 사용하여 `index.html`을 직접 전송합니다.
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'html'); // 만약 템플릿 엔진을 사용한다면 설정

// --- 라우팅 설정 ---

// 루트 경로 ('/') 요청 처리
app.get('/', (req, res) => {
  // src/views/index.html 파일을 클라이언트에게 전송
  // path.join()을 사용하여 OS에 관계없이 올바른 경로를 만듭니다.
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// --- 서버 시작 ---

app.listen(PORT, () => {
  console.log(`✨ Server is running on http://localhost:${PORT}`);
  console.log(`정적 파일은 ${path.join(__dirname, 'public')}에서 제공됩니다.`);
  console.log(`뷰 파일은 ${path.join(__dirname, 'views')}에 있습니다.`);
});
