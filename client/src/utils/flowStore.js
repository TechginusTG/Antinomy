import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";
import pako from "pako";
import chatService from "./chatService";
import { getUnlockedThemes } from "./themeManager";

const initialNodes = [
  {
    id: "1",
    type: "custom",
    position: { x: 100, y: 150 },
    data: { label: "문제", shape: "rectangle" },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 200, y: 250 },
    data: { label: "과정", shape: "rectangle" },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 300, y: 350 },
    data: { label: "해결", shape: "rectangle" },
  },
];
const initialEdges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

const useFlowStore = create((set, get) => {
  // Create deep copies of the initial state to prevent mutation.
  const nodes = JSON.parse(JSON.stringify(initialNodes));
  const edges = JSON.parse(JSON.stringify(initialEdges));

  return {
    nodes,
    edges,
    history: [{ nodes, edges }],
    historyIndex: 0,
    theme: localStorage.getItem("theme") || "light",
    customThemeColors: JSON.parse(localStorage.getItem("customThemeColors")) || [
      "#ffffff",
      "#f0f2f5",
      "#ffffff",
      "#f1f1f1",
      "#333333",
      "#555555",
      "#dddddd",
      "#000000",
      "antiquewhite",
      "aquamarine",
    ],
    chatWidth: parseInt(localStorage.getItem("chatWidth"), 10) || 30,
    chatFontSize: parseInt(localStorage.getItem("chatFontSize"), 10) || 14,
    mode: localStorage.getItem("mode") || 'basic',
    isSettingsOpen: false,
    isProfileModalOpen: false,
    isQuestOpen: false,
    isConnected: false,
    editingNodeId: null,
    recommendations: [],
    isTyping: false,

    setIsTyping: (isTyping) => set({ isTyping }),
    setIsConnected: (isConnected) => set({ isConnected }),
    setTheme: (theme) => {
      set({ theme });
      localStorage.setItem("theme", theme);
      document.body.setAttribute("data-theme", theme);
    },
    setCustomThemeColors: (index, color) => {
      const { customThemeColors } = get();
      const newColors = [...customThemeColors];
      newColors[index] = color;
      set({ customThemeColors: newColors });
      localStorage.setItem("customThemeColors", JSON.stringify(newColors));
      if (get().theme === 'custom') {
        document.documentElement.style.setProperty(get().getCustomColorVarName(index), color);
      }
    },
    setChatWidth: (width) => {
      set({ chatWidth: width });
      localStorage.setItem("chatWidth", width);
    },
    setChatFontSize: (size) => {
      set({ chatFontSize: size });
      localStorage.setItem("chatFontSize", size);
    },
    setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
    setIsProfileModalOpen: (isOpen) => set({ isProfileModalOpen: isOpen }),
    setIsQuestOpen: (isOpen) => set({ isQuestOpen: isOpen }),
    setEditingNodeId: (nodeId) => set({ editingNodeId: nodeId }),
    setMode: (mode) => {
      set({ mode });
      localStorage.setItem('mode', mode);
    },

    setRecommendations: (newRecommendations) => 
      set({ 
        recommendations: newRecommendations 
      }),

    clearRecommendations: () => set({ recommendations: [] }),

    resetCustomThemeColors: () => {
      const defaultColors = [
        "#ffffff",
        "#f0f2f5",
        "#ffffff",
        "#f1f1f1",
        "#333333",
        "#555555",
        "#dddddd",
        "#000000",
        "antiquewhite",
        "aquamarine",
      ];
      set({ customThemeColors: defaultColors });
      localStorage.setItem("customThemeColors", JSON.stringify(defaultColors));
      if (get().theme === 'custom') {
        defaultColors.forEach((color, index) => {
          document.documentElement.style.setProperty(get().getCustomColorVarName(index), color);
        });
      }
    },

    getCustomColorVarName: (index) => {
      const varNames = [
        "--background-primary",
        "--background-secondary",
        "--background-header",
        "--background-flow-wrapper",
        "--text-primary",
        "--text-secondary",
        "--border-color",
        "--header-title-color",
        "--bubble-user-bg",
        "--bubble-ai-bg",
      ];
      return varNames[index];
    },

    _updateHistory: (newState) => {
      const { history, historyIndex, autoSaveDiagram } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newState);
      const stateToSet = {
        ...newState,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
      set(stateToSet);
      autoSaveDiagram();
    },

    saveDiagramToLocalStorage: () => {
      const { nodes, edges } = get();
      const diagramData = { nodes, edges };

      const jsonString = JSON.stringify(diagramData);
      const compressed = pako.deflate(jsonString);
      const base64 = btoa(String.fromCharCode.apply(null, compressed));
      const safeEncodedData = base64
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
      localStorage.setItem("diagram-data", safeEncodedData);
    },

    autoSaveDiagram: () => {
      get().saveDiagramToLocalStorage();
    },

    onNodesChange: (changes) => {
      const { nodes, edges, _updateHistory } = get();
      const nextNodes = applyNodeChanges(changes, nodes);
      const isDragging = changes.some(
        (c) => c.type === "position" && c.dragging
      );
      if (isDragging) {
        set({ nodes: nextNodes });
      } else {
        _updateHistory({ nodes: nextNodes, edges });
      }
    },

    onEdgesChange: (changes) => {
      const { nodes, edges, _updateHistory } = get();
      const nextEdges = applyEdgeChanges(changes, edges);
      _updateHistory({ nodes, edges: nextEdges });
    },

    onConnect: (connection) => {
      const { nodes, edges, _updateHistory } = get();
      const nextEdges = addEdge({ ...connection, label: 'edge' }, edges);
      _updateHistory({ nodes, edges: nextEdges });
    },

    addNode: (position, shape = 'rectangle') => {
      const { nodes, edges, _updateHistory } = get();
      const newNodeId =
        (nodes.length > 0 ? Math.max(...nodes.map((n) => parseInt(n.id))) : 0) +
        1;
      const newNode = {
        id: newNodeId.toString(),
        type: "custom",
        position,
        data: { label: "New Node", shape },
      };
      const nextNodes = [...nodes, newNode];
      _updateHistory({ nodes: nextNodes, edges });
    },

    updateNodeLabel: (nodeId, label) => {
      const { nodes, edges, _updateHistory } = get();
      const nextNodes = nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, label } };
        }
        return node;
      });
      _updateHistory({ nodes: nextNodes, edges });
    },

    deleteNode: (nodeId) => {
      const { nodes, edges, _updateHistory } = get();
      const nextNodes = nodes.filter((node) => node.id !== nodeId);
      const nextEdges = edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
      _updateHistory({ nodes: nextNodes, edges: nextEdges });
    },

    updateEdgeLabel: (edgeId, label) => {
      const { nodes, edges, _updateHistory } = get();
      const nextEdges = edges.map((edge) => {
        if (edge.id === edgeId) {
          return { ...edge, label };
        }
        return edge;
      });
      _updateHistory({ nodes, edges: nextEdges });
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const prevState = history[historyIndex - 1];
        set({ ...prevState, historyIndex: historyIndex - 1 });
        get().autoSaveDiagram();
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextState = history[historyIndex + 1];
        set({ ...nextState, historyIndex: historyIndex + 1 });
        get().autoSaveDiagram();
      }
    },

    setFlow: (flow) => {
      const { nodes, edges } = flow;
      const newState = { nodes, edges };
      set({
        ...newState,
        history: [newState],
        historyIndex: 0,
      });
    },

    resetFlow: () => {
      const { _updateHistory } = get();
      _updateHistory({
        nodes: JSON.parse(JSON.stringify(initialNodes)),
        edges: JSON.parse(JSON.stringify(initialEdges)),
      });
    },

    save: (finalFilename, quests, completedQuests) => {
      if (!finalFilename) {
        console.error("Save function called without a filename.");
        return;
      }

      const { nodes, edges } = get();
      const diagramData = { nodes, edges };

      const chatLogString = localStorage.getItem("chatLog");
      const chatHistory = chatLogString ? JSON.parse(chatLogString) : [];

      const combinedData = {
        diagramData,
        chatHistory,
        quests,
        completedQuests,
      };

      const blob = new Blob([JSON.stringify(combinedData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    saveTheme: (finalFilename) => {
      if (!finalFilename) {
        console.error("Save function called without a filename.");
        return;
      }

      const { customThemeColors } = get();

      const blob = new Blob([JSON.stringify({ customThemeColors }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    loadTheme: (fileContent) => {
      const { customThemeColors } = fileContent;
      if (customThemeColors) {
        set({ customThemeColors });
        localStorage.setItem("customThemeColors", JSON.stringify(customThemeColors));
        if (get().theme === 'custom') {
          customThemeColors.forEach((color, index) => {
            document.documentElement.style.setProperty(get().getCustomColorVarName(index), color);
          });
        }
      }
    },

    loadDiagram: () => {
      const safeEncodedData = localStorage.getItem("diagram-data");

      if (!safeEncodedData) {
        get().resetFlow();
        return;
      }

      try {
        let base64 = safeEncodedData.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }

        const decodedData = atob(base64);
        const len = decodedData.length;
        const compressed = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            compressed[i] = decodedData.charCodeAt(i);
        }
        const jsonString = pako.inflate(compressed, { to: "string" });
        const data = JSON.parse(jsonString);

        get().setFlow(data);

      } catch (error) {
        console.error("Failed to load from localStorage:", error);
        localStorage.removeItem("diagram-data");
        get().resetFlow();
      }
    },

    deleteMessage: (messageId, setChatLog) => {
      const chatLogString = localStorage.getItem("chatLog");
      let chatHistory = chatLogString ? JSON.parse(chatLogString) : [];
      const messageIndex = chatHistory.findIndex((msg) => msg.id === messageId);

      if (messageIndex > -1) {
        chatHistory.splice(messageIndex);
        // The component will update localStorage via its useEffect
        setChatLog(chatHistory);
      }
    },

    editMessage: (messageId, newText, setChatLog) => {
      const chatLogString = localStorage.getItem("chatLog");
      let chatHistory = chatLogString ? JSON.parse(chatLogString) : [];
      const messageIndex = chatHistory.findIndex((msg) => msg.id === messageId);

      if (messageIndex > -1) {
        // Update the content of the message being edited
        chatHistory[messageIndex].content = newText;
        // Remove all messages after the edited one
        chatHistory.splice(messageIndex + 1);

        // Update the UI with the truncated log
        setChatLog(chatHistory);

        // Resubmit the truncated history to the server.
        // The server will respond with a "chat message" event,
        // which will be handled by the global listener in ChatSider.
        chatService.resubmit(chatHistory);
      }
    }
  };
});

export default useFlowStore;
