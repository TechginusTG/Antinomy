// GPT + TLDraw 예제 (OpenAI 연동)
import React, { useRef } from 'react';
import { Tldraw, useEditor } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

// 실제 GPT API 호출 함수
async function fetchGPTCommand(prompt) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer YOUR_OPENAI_API_KEY`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "사용자의 자연어 명령을 아래 JSON 형식으로 변환하세요: { type: 'circle'|'rectangle'|'line'|'text', x: number, y: number, ... }. 모든 좌표는 임의의 값으로 설정해도 됩니다.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0,
    }),
  });

  const data = await response.json();
  try {
    const codeBlock = data.choices[0].message.content.match(/\{[\s\S]*\}/);
    if (codeBlock) return JSON.parse(codeBlock[0]);
  } catch {
    return null;
  }
  return null;
}

function GPTDrawWrapper() {
  const editorRef = useRef(null);

  const handleUserCommand = async (input) => {
    const editor = editorRef.current;
    if (!editor) return;

    const command = await fetchGPTCommand(input);
    if (!command) return alert("GPT가 명령을 이해하지 못했어요.");

    switch (command.type) {
      case 'circle':
        editor.createShape({
          id: 'shape:' + Date.now(),
          type: 'geo',
          x: command.x,
          y: command.y,
          props: {
            geo: 'ellipse',
            w: command.radius * 2,
            h: command.radius * 2,
          },
        });
        break;
      case 'rectangle':
        editor.createShape({
          id: 'shape:' + Date.now(),
          type: 'geo',
          x: command.x,
          y: command.y,
          props: {
            geo: 'rectangle',
            w: command.width,
            h: command.height,
          },
        });
        break;
      case 'line':
        editor.createShape({
          id: 'shape:' + Date.now(),
          type: 'arrow',
          x: command.x,
          y: command.y,
          props: {
            start: { x: 0, y: 0 },
            end: { x: command.x2 - command.x, y: command.y2 - command.y },
          },
        });
        break;
      case 'text':
        editor.createShape({
          id: 'shape:' + Date.now(),
          type: 'text',
          x: command.x,
          y: command.y,
          props: {
            text: command.text || '텍스트',
            font: 'draw',
            size: 'm',
            align: 'start',
          },
        });
        break;
      default:
        alert("알 수 없는 도형 유형입니다.");
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 8, background: '#f0f0f0' }}>
        <input
          type="text"
          placeholder="예: 동그라미 하나 그려줘 / 사각형 그려줘 / 선 그려줘 / 텍스트 써줘"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleUserCommand(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
          style={{ width: '100%', padding: 8 }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <Tldraw onMount={(editor) => (editorRef.current = editor)} />
      </div>
    </div>
  );
}

export default GPTDrawWrapper;
