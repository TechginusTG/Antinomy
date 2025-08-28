export const diagramPrompt = `
        Based on the following conversation and the current diagram state, generate an updated diagram.
        The diagram should represent the key topics and their relationships from the conversation.
        Conversation History:
        __CHAT_LOG__

        Current Diagram State:
        Nodes: __NODES__

        Your task is to output a new diagram structure in a single, minified JSON object format. Do not calculate node positions.

        **Output Format:**
        - The JSON object must have three keys: "nodes", "edges", and "quests".
        - "nodes" should be an array of objects, each with "id", "type" (use 'custom'), and "data" ({ "label": "..." }). Do NOT include a "position" key.
        - "edges" should be an array of objects, each with "id", "source" (source node id), and "target" (target node id).
        - **Challenge Generation:** Based on the conversation, create 2-3 simple, concise challenges for the user in the '-하기' style (e.g., "문제 원인 분석하기"). These should be returned in the "quests" key as an array of strings.
        
        Make sure all IDs are unique strings.
        Do not include any explanations, comments, or any text outside of the single JSON object.
        Example response: {"nodes":[{"id":"1","type":"custom","data":{"label":"Main Idea"}}],"edges":[],"quests":["Challenge 1", "Challenge 2"]}
        `;
