// src/server.js

const express = require('express');
const path = require('path'); // 파일 경로를 다루기 위한 Node.js 내장 모듈

const app = express();
const PORT = process.env.PORT || 3000; // 환경 변수에 PORT가 설정되어 있으면 사용, 없으면 3000번 포트 사용


// 1. 정적 파일 서비스 설정: src/public 폴더를 정적 파일 제공 폴더로 지정
app.use(express.static(path.join(__dirname, 'public')));

// 2. 뷰 엔진 설정 (선택 사항: 여기서는 HTML 파일을 직접 전송하므로 EJS/Pug 같은 템플릿 엔진은 필요 없음)
// 하지만 만약 나중에 동적으로 HTML을 생성할 필요가 있다면 템플릿 엔진을 설정할 수 있습니다.


// 루트 경로 ('/') 요청 처리
app.get('/', (req, res) => {
  // src/views/index.html 파일을 클라이언트에게 전송
  // path.join()을 사용하여 OS에 관계없이 올바른 경로를 만듭니다.
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/isvisited', (req, res) => {
  // src/views/index.html 파일을 클라이언트에게 전송
  // path.join()을 사용하여 OS에 관계없이 올바른 경로를 만듭니다.
  res.sendFile(path.join(__dirname, 'views', 'firstScreen.html'));
});
// --- 모든 정의되지 않은 경로를 루트로 리디렉션 (추가된 코드) ---
// 이 미들웨어는 위의 app.get('/') 라우트가 처리하지 못한 모든 요청을 잡습니다.
app.use((req, res) => {
    // 이미 응답 헤더가 전송되지 않았다면 (즉, 다른 라우트나 정적 파일이 처리되지 않았다면)
    if (!res.headersSent) {
        res.redirect('/');
    }
    // 만약 이미 응답이 전송되었다면, 아무것도 하지 않고 다음 미들웨어로 넘어가지 않습니다.
    // (이 부분이 마지막 미들웨어이므로 사실상 요청 처리는 여기서 끝납니다)
});

// --- 서버 시작 ---

app.listen(PORT, () => {
  console.log(`✨ Server is running on http://localhost:${PORT}`);
  console.log(`정적 파일은 ${path.join(__dirname, 'public')}에서 제공됩니다.`);
  console.log(`뷰 파일은 ${path.join(__dirname, 'views')}에 있습니다.`);
});
