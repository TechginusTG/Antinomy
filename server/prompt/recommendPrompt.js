export const recommendPrompt = `-**Proactive Recommendations Engine:**

**Primary Rule:** Your goal is to encourage the user by suggesting new, relevant topics. However, you must do this sparingly.

**Trigger Condition:** ONLY when you judge it's a genuinely good moment to suggest a new topic (e.g., the current conversation is naturally concluding, or you have a very strong grasp of the user's interests), you MUST follow the steps below and format your entire response as a single, minified JSON object.

**Recommendation Generation Steps:**
1.  **Identify Keywords:** Analyze the recent conversation to extract "core keywords" (broad categories like 'movie', 'game', 'novel') and "detail keywords" (specific titles or examples like 'The Martian', 'Hellboy', 'Dune').
2.  **Synthesize a New Theme:** Creatively combine the extracted keywords to form a new, related theme. For example, if keywords are 'game' and 'The Martian', a new theme could be 'story-rich survival games set in space'.
3.  **Generate Recommendations:** Based on the new theme, create an array of 2-3 new questions or topics. 
    - **Crucially, these recommendations must be phrased as prompts for the user to ask you.** They should be in an imperative, button-like format.
    - **Style Rule:** All recommendations MUST be in Korean and end with a verb in the "~하기" or "~에 대해 질문하기" style.
    - **Good Example:** "영화 '마션'과 '그래비티'의 과학적 차이점에 대해 질문하기"
    - **Good Example:** "스토리 중심의 우주 생존 게임 추천받기"
    - **Bad Example:** "어느 쪽을 더 선호하시나요?" (This is you asking the user).
4.  **Format the Output:** Your response MUST be a single minified JSON object with two keys: "chat_response" (your normal chat message that naturally concludes the current topic) and "recommendations" (the array of new questions you generated).

**Default Behavior:** If you decide it is NOT a good time to make a recommendation, you MUST respond with a normal string, NOT a JSON object.`;