# Antinomy

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


AI와 함께, 당신의 아이디어를 현실로 만드는 첫 걸음.

## 1. 프로젝트 소개

Antinomy는 스스로 목표를 설정하고 달성하고자 하는 사람들을 위한 AI 기반의 생각 정리 및 계획 구체화 도우미입니다.

사용자가 해결하고 싶은 문제나 이루고 싶은 목표에 대해 AI와 대화를 시작하면, Antinomy는 정해진 답을 주기보다 사용자가 스스로 최적의 해결책을 찾을 수 있도록 생각의 과정을 유도합니다.
이 과정에서 Antinomy는 문제 탐색, 해결책 생성, 결론 도출의 3단계 문제 해결 프로세스를 따르며, 사용자가 체계적으로 사고를 정리할 수 있도록 돕습니다.

대화가 충분히 진행된 후, `makeDiagram` 기능을 통해 전체 대화의 흐름을 한눈에 파악할 수 있는 순서도 다이어그램을 생성할 수 있습니다. 이 다이어그램은 아이디어를 시각적으로 구조화하여 복잡한 생각을 명확하게 정리해줍니다.

## 2. 주요 기능

- **AI 채팅**: OpenAI 기반의 AI와 실시간으로 대화하며, 정해진 답 대신 사용자가 스스로 아이디어를 구체화하고 최적의 해결책을 찾도록 생각의 과정을 유도합니다.
- **채팅방 관리**: 여러 주제에 대한 생각을 별도의 채팅방에서 관리하고 이어갈 수 있습니다.
- **메시지 삭제**: 특정 메시지부터 그 이후의 모든 대화 내용을 삭제하여 대화 흐름을 재구성할 수 있습니다.
- **순서도 다이어그램 생성**: AI와의 대화 내용을 바탕으로 핵심적인 내용을 요약한 순서도를 자동으로 생성하여, 생각의 흐름을 시각적으로 정리해줍니다.
- **'좋아요' 메시지**: 중요한 대화나 아이디어를 '좋아요'로 표시하고, 언제든지 다시 모아볼 수 있습니다.
- **퀘스트 시스템**: 다이어그램이 생성되면, 목표 달성을 위한 구체적인 실행 과제(퀘스트)를 AI가 제안해줍니다. 이를 통해 막연했던 목표를 실질적인 행동으로 옮길 수 있도록 돕습니다.
- **경험치(EXP) 시스템**: 퀘스트를 완료하며 경험치를 얻는 게이미피케이션 요소를 통해 동기를 부여합니다.
- **사용자 맞춤 설정**: 프로필 정보와 개인화된 설정을 관리할 수 있습니다.
- **실시간 연결 상태 표시**: 서버와의 연결 상태를 UI에 표시하여 안정적인 사용 환경을 제공합니다.

## 3. 기술 스택

- **Frontend**: React, Vite, Socket.IO Client, CSS Modules
- **Backend**: Node.js, Express, Socket.IO, OpenAI API
- **Database**: Knex.js, PostgreSQL 
- **공통**: JavaScript (ES6+), npm

## 4. 서비스 이용하기

Antinomy는 아래 웹사이트에서 바로 이용하실 수 있습니다.

**[https://syncro.tg-antinomy.kro.kr](https://syncro.tg-antinomy.kro.kr)**

<details>
<summary><b>개발자를 위한 로컬 환경 설정</b></summary>

직접 코드를 수정하거나 개발에 참여하고 싶은 경우 아래의 방법으로 로컬 환경을 설정할 수 있습니다.

1.  **저장소 복제**
    ```bash
    git clone https://github.com/TechginusTG/Antinomy.git
    cd Antinomy
    ```

2.  **의존성 설치**
    ```bash
    npm install
    ```

3.  **환경 변수 설정**
    프로젝트 루트 디렉토리에 `.env` 파일을 생성하고, 다음 내용을 추가합니다.

    ```
    # OpenAI API Key (필수)
    OPENAI_API_KEY=your_openai_api_key

    # JWT (JSON Web Token) 비밀 키 (필수)
    # 사용자 인증 토큰 생성 및 검증에 사용됩니다. 보안을 위해 강력하고 유니크한 문자열을 사용하세요.
    JWT_SECRET=your_jwt_secret_key

    # 데이터베이스 연결 URL (필수)
    # Knex.js를 통해 PostgreSQL 데이터베이스에 연결하는 데 사용됩니다.
    # 예: postgresql://user:password@host:port/database
    DATABASE_URL=your_database_connection_string

    # 프론트엔드 소켓 연결 URL (선택 사항, 로컬 개발 시 기본값 사용)
    # 프로덕션 환경에서는 프론트엔드가 백엔드 소켓 서버에 연결할 주소를 지정합니다.
    # 예: VITE_SOCKET_URL=https://api.yourdomain.com
    VITE_SOCKET_URL=

    # 환경 (프로덕션 서버 실행 시 필요)
    # 'production'으로 설정하면 프로덕션 빌드 및 최적화가 적용됩니다.
    # npm run dev 사용 시에는 자동으로 'development'로 설정됩니다.
    NODE_ENV=production
    ```

4.  **데이터베이스 마이그레이션**
    최신 데이터베이스 스키마를 적용합니다.
    ```bash
    npx knex migrate:latest --knexfile knexfile.cjs
    ```

5.  **개발 서버 실행**
    ```bash
    npm run dev
    ```
    위 명령어를 실행하면 클라이언트와 서버가 동시에 개발 모드로 실행됩니다.

</details>
