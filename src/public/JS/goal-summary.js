// goal-summary.js

// 목표 요약 업데이트
export function updateGoalSummary() {
    const chatLog = document.getElementById('chatLog');
    const gptResponses = chatLog.querySelectorAll('.response-box.gpt'); // 모든 GPT 응답 가져오기
    let summaryText = "아직 요약된 목표가 없습니다.";

    if (gptResponses.length > 0) {
        summaryText = "--- 대화 요약된 목표 ---\n";
        let stepCounter = 1;
        gptResponses.forEach((responseDiv, index) => {
            const text = responseDiv.textContent.replace('ChatGPT:', '').trim();
            const cleanedText = text.trim().replace(/\n{2,}/g, '\n').replace(/\t/g, ' ');

            // 특정 키워드 포함 시 단계로 요약
            if (cleanedText.includes("단계") || cleanedText.includes("시작") || cleanedText.includes("다음으로") || cleanedText.includes("중요")) {
                summaryText += `${stepCounter}. ${cleanedText}\n`;
                stepCounter++;
            } else if (index === gptResponses.length - 1 && stepCounter === 1) {
                // 첫 번째 단계가 없으면 마지막 응답을 첫 단계로
                summaryText += `${stepCounter}. ${cleanedText}\n`;
            }
        });
        // 모든 응답을 검토한 후에도 stepCounter가 1이고 응답이 있으면 마지막 응답을 요약
        if (stepCounter === 1 && gptResponses.length > 0) {
            const lastCleanedText = gptResponses[gptResponses.length - 1].textContent.replace('ChatGPT:', '').trim().replace(/\n{2,}/g, '\n').replace(/\t/g, ' ');
            summaryText += `1. ${lastCleanedText}\n`;
        }
    }
    const summarizedGoalContent = document.getElementById('summarizedGoalContent');
    if (summarizedGoalContent) {
        summarizedGoalContent.textContent = summaryText; // 요약 내용 업데이트
    }
}

// XML로 내보내기
export function exportToXML() {
    let textToExport = "";
    const lastResponseElement = document.getElementById('lastResponse');
    if (lastResponseElement) {
        textToExport = lastResponseElement.textContent.replace('ChatGPT:', '').trim().replace(/\n{2,}/g, '\n').replace(/\t/g, ' ');
    } else {
        const diagramContent = document.getElementById('diagramContent');
        if (diagramContent) {
            textToExport = diagramContent.textContent;
        }
    }

    // XML 형식으로 변환
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<response>\n  <text>${textToExport}</text>\n</response>`;
    const blob = new Blob([xmlContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram_response.xml'; // 파일명 지정
    a.click();
    URL.revokeObjectURL(url); // URL 해제
}