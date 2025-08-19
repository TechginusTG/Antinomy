# Antinomy

AI와 함께, 당신의 아이디어를 현실로 만드는 첫 걸음.

## 1. 프로젝트 소개

Antinomy는 스스로 목표를 설정하고 달성하고자 하는 사람들을 위한 AI 기반의 생각 정리 및 계획 구체화 도우미입니다.

사용자가 해결하고 싶은 문제나 이루고 싶은 목표에 대해 AI와 대화를 시작하면, Antinomy는 정해진 답을 주기보다 사용자가 스스로 최적의 해결책을 찾을 수 있도록 생각의 과정을 유도합니다.

대화가 충분히 진행된 후, `makeDiagram` 기능을 통해 전체 대화의 흐름을 한눈에 파악할 수 있는 순서도 다이어그램을 생성할 수 있습니다. 이 다이어그램은 아이디어를 시각적으로 구조화하여 복잡한 생각을 명확하게 정리해줍니다.

## 2. 주요 기능

- **AI 채팅**: OpenAI 기반의 AI와 실시간으로 대화하며 아이디어를 구체화합니다.
- **순서도 다이어그램 생성**: AI와의 대화 내용을 바탕으로 핵심적인 내용을 요약한 순서도를 자동으로 생성하여, 생각의 흐름을 시각적으로 정리해줍니다.
- **퀘스트 시스템**: 다이어그램이 생성되면, 목표 달성을 위한 구체적인 실행 과제(퀘스트)를 AI가 제안해줍니다. 이를 통해 막연했던 목표를 실질적인 행동으로 옮길 수 있도록 돕습니다.
- **경험치(EXP) 시스템**: 퀘스트를 완료하며 경험치를 얻는 게이미피케이션 요소를 통해 동기를 부여합니다.
- **실시간 연결 상태 표시**: 서버와의 연결 상태를 UI에 표시하여 안정적인 사용 환경을 제공합니다.

## 3. 기술 스택

- **Frontend**: React, Vite, Socket.IO Client, CSS Modules
- **Backend**: Node.js, Express, Socket.IO, OpenAI API
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
    프로젝트 루트 디렉토리에 `.env` 파일을 생성하고, 발급받은 OpenAI API 키를 추가합니다.
    ```
    OPENAI_API_KEY=your_openai_api_key
    ```

4.  **개발 서버 실행**
    ```bash
    npm run dev
    ```
    위 명령어를 실행하면 클라이언트와 서버가 동시에 개발 모드로 실행됩니다.

</details>