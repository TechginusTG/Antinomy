import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";
import pako from "pako";
import chatService from "./chatService";
import { getUnlockedThemes } from "./themeManager";
import useUserStore from "./userStore"; // userStore import 추가

const initialNodes = [
  {
    id: "1",
    type: "custom",
    position: { x: 100, y: 150 },
    data: { label: "\uBB60\uC81C", shape: "rectangle" },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 200, y: 250 },
    data: { label: "\uACFC\uC815", shape: "rectangle" },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 300, y: 350 },
    data: { label: "\uD574\uACB0", shape: "rectangle" },
  },
];
const initialEdges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

let diagramDebounceTimer;
let settingsDebounceTimer; // 설정 저장용 디바운스 타이머

const useFlowStore = create((set, get) => {
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
    
    // --- 설정 관련 함수들 수정 ---
    setTheme: (theme) => {
      set({ theme });
      localStorage.setItem("theme", theme);
      document.body.setAttribute("data-theme", theme);
      useUserStore.getState().updateSetting('theme', theme);
      get().autoSaveSettings();
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
      useUserStore.getState().updateSetting('customThemeColors', newColors);
      get().autoSaveSettings();
    },
    setChatWidth: (width) => {
      set({ chatWidth: width });
      localStorage.setItem("chatWidth", width);
    },
    setChatFontSize: (size) => {
      set({ chatFontSize: size });
      localStorage.setItem("chatFontSize", size);
    },
    setMode: (mode) => {
      set({ mode });
      localStorage.setItem('mode', mode);
      useUserStore.getState().updateSetting('mode', mode);
      get().autoSaveSettings();
    },

    setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
    setIsProfileModalOpen: (isOpen) => set({ isProfileModalOpen: isOpen }),
    setIsQuestOpen: (isOpen) => set({ isQuestOpen: isOpen }),
    setEditingNodeId: (nodeId) => set({ editingNodeId: nodeId }),

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
      useUserStore.getState().updateSetting('customThemeColors', defaultColors);
      get().autoSaveSettings();
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

    // --- DB 저장 관련 함수 ---
    saveDiagramToDb: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

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

      try {
        await fetch('/api/diagram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ diagram_data: safeEncodedData }),
        });
      } catch (error) {
        console.error("Failed to save diagram to DB:", error);
      }
    },

    autoSaveDiagram: () => {
      clearTimeout(diagramDebounceTimer);
      diagramDebounceTimer = setTimeout(() => {
        get().saveDiagramToDb();
      }, 1000);
    },

    saveSettings: async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const { settings } = useUserStore.getState();

      try {
        await fetch('/api/user/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(settings),
        });
      } catch (error) {
        console.error("Failed to save settings to DB:", error);
      }
    },

    autoSaveSettings: () => {
      clearTimeout(settingsDebounceTimer);
      settingsDebounceTimer = setTimeout(() => {
        get().saveSettings();
      }, 1500);
    },

    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },

    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },

    onNodeDragStop: () => {
      const { nodes, edges, _updateHistory } = get();
      _updateHistory({ nodes, edges });
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

    save: (finalFilename, chatHistory, quests, completedQuests) => {
      if (!finalFilename) {
        console.error("저장 함수가 파일 이름 없이 호출되었습니다.");
        return;
      }

      const { nodes, edges } = get();
      const diagramData = { nodes, edges };

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

    importFromFile: (fileContent) => {
      const { setFlow, loadTheme } = get();
      try {
        const data = JSON.parse(fileContent);

        if (
          data.chatHistory &&
          data.chatHistory.length > 0 &&
          data.chatHistory[0].text !== undefined
        ) {
          data.chatHistory = data.chatHistory.map((msg, index) => ({
            id: msg.id || Date.now() + index,
            content: msg.text,
            sender: msg.sender,
          }));
        }

        if (data.diagramData && data.chatHistory) {
            setFlow(data.diagramData);
            return {
                chatHistory: data.chatHistory,
                quests: data.quests,
                completedQuests: data.completedQuests,
                error: null,
            };
        } else {
            if (data.customThemeColors) {
                loadTheme(data);
                return { error: null };
            }
            throw new Error("지원하지 않는 파일 형식입니다.");
        }
      } catch (e) {
          console.error("파일을 불러오는 데 실패했습니다:", e);
          return { error: "파일을 불러오는 데 실패했습니다. 손상되었거나 유효한 파일이 아닐 수 있습니다." };
      }
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
        useUserStore.getState().updateSetting('customThemeColors', customThemeColors);
        get().autoSaveSettings();
      }
    },

    setAllCustomThemeColors: (colors) => {
      set({ customThemeColors: colors });
      localStorage.setItem("customThemeColors", JSON.stringify(colors));
      if (get().theme === 'custom') {
        colors.forEach((color, index) => {
          document.documentElement.style.setProperty(get().getCustomColorVarName(index), color);
        });
      }
      useUserStore.getState().updateSetting('customThemeColors', colors);
      get().autoSaveSettings();
    },

    loadDiagramFromLocalStorage: () => {
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
        setChatLog(chatHistory);
      }
    },

    editMessage: (messageId, newText, setChatLog) => {
      const chatLogString = localStorage.getItem("chatLog");
      let chatHistory = chatLogString ? JSON.parse(chatLogString) : [];
      const messageIndex = chatHistory.findIndex((msg) => msg.id === messageId);

      if (messageIndex > -1) {
        chatHistory[messageIndex].content = newText;
        chatHistory.splice(messageIndex + 1);

        setChatLog(chatHistory);

        chatService.resubmit(chatHistory);
      }
    }
  };
});

export default useFlowStore;