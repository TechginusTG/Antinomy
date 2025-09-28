export const diagramPrompt = `
        Based on the following conversation and the current diagram state, generate an updated diagram.
        Your primary task is to analyze the user's thought process in the conversation and represent it as either a **flowchart** or a **mind map**.

        - If the conversation is about a process, sequence, or decision-making, create a **flowchart**.
        - If the conversation is about brainstorming, exploring ideas, or relationships between concepts, create a **mind map**.

        **Flowchart Instructions:**
        - Use different shapes for different purposes: rectangles for processes, ellipses for start/end points, and **sparingly, diamonds for clear binary decisions (e.g., Yes/No, True/False). Diamond nodes MUST have at least two outgoing edges, each labeled with a condition like 'Yes' or 'No'.**

        **Mind Map Instructions:**
        - Start with a central topic and branch out with related ideas. Use consistent shapes like rectangles or ellipses.

        Add labels to edges only when necessary to clarify the relationship between nodes (e.g., "leads to", "is a part of", "answers").
        Conversation History:
        __CHAT_LOG__

        Current Diagram State:
        Nodes: __NODES__

        Your task is to output a new diagram structure in a single, minified JSON object format. Do not calculate node positions.

        **Output Format:**
        - The JSON object must have three keys: "nodes", "edges", and "quests".
        - "nodes" should be an array of objects, each with "id", "type" (use 'custom'), and "data" ({ "label": "...", "shape": "rectangle" | "ellipse" | "diamond" }). Do NOT include a "position" key.
        - "edges" should be an array of objects, each with "id", "source" (source node id), "target" (target node id), and "label" (e.g., "Yes", "No").
        - **Challenge Generation:** Based on the conversation, create 2-3 simple, concise challenges for the user in the '-하기' style (e.g., "문제 원인 분석하기"). These should be returned in the "quests" key as an array of strings.
        
        Make sure all IDs are unique strings.
        Do not include any explanations, comments, or any text outside of the single JSON object.
        Example response: {"nodes":[{"id":"1","type":"custom","data":{"label":"Start","shape":"ellipse"}},{"id":"2","type":"custom","data":{"label":"Is it good?","shape":"diamond"}},{"id":"3","type":"custom","data":{"label":"Process Yes","shape":"rectangle"}},{"id":"4","type":"custom","data":{"label":"Process No","shape":"rectangle"}}],"edges":[{"id":"e1-2","source":"1","target":"2"},{"id":"e2-3","source":"2","target":"3","label":"Yes"},{"id":"e2-4","source":"2","target":"4","label":"No"}],"quests":["Challenge 1", "Challenge 2"]}
        `;
