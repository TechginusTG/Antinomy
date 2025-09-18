import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";
import pako from "pako";
import chatService from "./chatService";
import useUserStore from "./userStore";

const initialNodes = [
  { id: "1", type: "custom", position: { x: 100, y: 150 }, data: { label: "문제", shape: "rectangle" } },
  { id: "2", type: "custom", position: { x: 200, y: 250 }, data: { label: "과정", shape: "rectangle" } },
  { id: "3", type: "custom", position: { x: 300, y: 350 }, data: { label: "해결", shape: "rectangle" } },
];
const initialEdges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

const createInitialDiagramState = () => ({
  nodes: JSON.parse(JSON.stringify(initialNodes)),
  edges: JSON.parse(JSON.stringify(initialEdges)),
  history: [{ nodes: JSON.parse(JSON.stringify(initialNodes)), edges: JSON.parse(JSON.stringify(initialEdges)) }],
  historyIndex: 0,
});

let diagramDebounceTimer;
let settingsDebounceTimer;

const useFlowStore = create((set, get) => ({
  diagrams: {}, // { [roomId]: { nodes, edges, history, historyIndex } }
  activeRoomId: null,
  
  theme: localStorage.getItem("theme") || "light",
  customThemeColors: JSON.parse(localStorage.getItem("customThemeColors")) || [
    "#ffffff", "#f0f2f5", "#ffffff", "#f1f1f1", "#333333",
    "#555555", "#dddddd", "#000000", "antiquewhite", "aquamarine",
  ],
  chatWidth: parseInt(localStorage.getItem("chatWidth"), 10) || 30,
  chatFontSize: parseInt(localStorage.getItem("chatFontSize"), 10) || 14,
  mode: localStorage.getItem("mode") || "basic",
  isSettingsOpen: false,
  isProfileModalOpen: false,
  isQuestOpen: false,
  isLikedMessagesModalOpen: false,
  isConnected: false,
  editingNodeId: null,
  recommendations: [],
  isTyping: false,

  nodes: () => get().diagrams[get().activeRoomId]?.nodes || [],
  edges: () => get().diagrams[get().activeRoomId]?.edges || [],
  history: () => get().diagrams[get().activeRoomId]?.history || [],
  historyIndex: () => get().diagrams[get().activeRoomId]?.historyIndex || 0,

  setIsTyping: (isTyping) => set({ isTyping }),
  setIsConnected: (isConnected) => set({ isConnected }),

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem("theme", theme);
    document.body.setAttribute("data-theme", theme);
    useUserStore.getState().updateSetting("theme", theme);
    get().autoSaveSettings();
  },
  setCustomThemeColors: (index, color) => {
    const { customThemeColors } = get();
    const newColors = [...customThemeColors];
    newColors[index] = color;
    set({ customThemeColors: newColors });
    localStorage.setItem("customThemeColors", JSON.stringify(newColors));
    if (get().theme === "custom") {
      document.documentElement.style.setProperty(
        get().getCustomColorVarName(index),
        color
      );
    }
    useUserStore.getState().updateSetting("customThemeColors", newColors);
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
    localStorage.setItem("mode", mode);
    useUserStore.getState().updateSetting("mode", mode);
    get().autoSaveSettings();
  },

  setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  setIsProfileModalOpen: (isOpen) => set({ isProfileModalOpen: isOpen }),
  setIsQuestOpen: (isOpen) => set({ isQuestOpen: isOpen }),
  setIsLikedMessagesModalOpen: (isOpen) => set({ isLikedMessagesModalOpen: isOpen }),
  setEditingNodeId: (nodeId) => set({ editingNodeId: nodeId }),

  setRecommendations: (newRecommendations) =>
    set({
      recommendations: newRecommendations,
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
    if (get().theme === "custom") {
      defaultColors.forEach((color, index) => {
        document.documentElement.style.setProperty(
          get().getCustomColorVarName(index),
          color
        );
      });
    }
    useUserStore.getState().updateSetting("customThemeColors", defaultColors);
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

  _updateActiveDiagramState: (newDiagramState) => {
    const { activeRoomId, diagrams } = get();
    if (!activeRoomId) return;

    set({
      diagrams: {
        ...diagrams,
        [activeRoomId]: {
          ...diagrams[activeRoomId],
          ...newDiagramState,
        },
      },
    });
  },

  _updateHistory: (newState) => {
    const { activeRoomId, diagrams, autoSaveDiagram } = get();
    if (!activeRoomId) return;

    const history = diagrams[activeRoomId]?.history || [];
    const historyIndex = diagrams[activeRoomId]?.historyIndex || 0;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    get()._updateActiveDiagramState({
      ...newState,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });

    autoSaveDiagram();
  },

  saveDiagramToDb: async () => {
    const { activeRoomId, nodes, edges } = get();
    const token = localStorage.getItem("authToken");
    if (!token || !activeRoomId) return;

    const diagramData = { nodes: nodes(), edges: edges() };

    const jsonString = JSON.stringify(diagramData);
    const compressed = pako.deflate(jsonString);
    const base64 = btoa(String.fromCharCode.apply(null, compressed));
    const safeEncodedData = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

    try {
      await fetch(`/api/diagram/${activeRoomId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const { settings } = useUserStore.getState();

    try {
      await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    const { nodes, _updateActiveDiagramState } = get();
    const newNodes = applyNodeChanges(changes, nodes());
    _updateActiveDiagramState({ nodes: newNodes });
  },

  onEdgesChange: (changes) => {
    const { edges, _updateActiveDiagramState } = get();
    const newEdges = applyEdgeChanges(changes, edges());
    _updateActiveDiagramState({ edges: newEdges });
  },

  onNodeDragStop: () => {
    const { nodes, edges, _updateHistory } = get();
    _updateHistory({ nodes: nodes(), edges: edges() });
  },

  onConnect: (connection) => {
    const { nodes, edges, _updateHistory } = get();
    const nextEdges = addEdge({ ...connection, label: "edge" }, edges());
    _updateHistory({ nodes: nodes(), edges: nextEdges });
  },

  addNode: (position, shape = "rectangle") => {
    const { nodes, edges, _updateHistory } = get();
    const currentNodes = nodes();
    const newNodeId =
      (currentNodes.length > 0 ? Math.max(...currentNodes.map((n) => parseInt(n.id))) : 0) +
      1;
    const newNode = {
      id: newNodeId.toString(),
      type: "custom",
      position,
      data: { label: "New Node", shape },
    };
    const nextNodes = [...currentNodes, newNode];
    _updateHistory({ nodes: nextNodes, edges: edges() });
  },

  updateNodeLabel: (nodeId, label) => {
    const { nodes, edges, _updateHistory } = get();
    const nextNodes = nodes().map((node) => {
      if (node.id === nodeId) {
        return { ...node, data: { ...node.data, label } };
      }
      return node;
    });
    _updateHistory({ nodes: nextNodes, edges: edges() });
  },

  deleteNode: (nodeId) => {
    const { nodes, edges, _updateHistory } = get();
    const nextNodes = nodes().filter((node) => node.id !== nodeId);
    const nextEdges = edges().filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    );
    _updateHistory({ nodes: nextNodes, edges: nextEdges });
  },

  updateEdgeLabel: (edgeId, label) => {
    const { nodes, edges, _updateHistory } = get();
    const nextEdges = edges().map((edge) => {
      if (edge.id === edgeId) {
        return { ...edge, label };
      }
      return edge;
    });
    _updateHistory({ nodes: nodes(), edges: nextEdges });
  },

  undo: () => {
    const { history, historyIndex, _updateActiveDiagramState, autoSaveDiagram } = get();
    const currentHistory = history();
    const currentHistoryIndex = historyIndex();
    if (currentHistoryIndex > 0) {
      const prevState = currentHistory[currentHistoryIndex - 1];
      _updateActiveDiagramState({ ...prevState, historyIndex: currentHistoryIndex - 1 });
      autoSaveDiagram();
    }
  },

  redo: () => {
    const { history, historyIndex, _updateActiveDiagramState, autoSaveDiagram } = get();
    const currentHistory = history();
    const currentHistoryIndex = historyIndex();
    if (currentHistoryIndex < currentHistory.length - 1) {
      const nextState = currentHistory[currentHistoryIndex + 1];
      _updateActiveDiagramState({ ...nextState, historyIndex: currentHistoryIndex + 1 });
      autoSaveDiagram();
    }
  },

  setFlow: (flow) => {
    const { nodes, edges } = flow;
    const newState = { nodes, edges };
    get()._updateActiveDiagramState({
      ...newState,
      history: [newState],
      historyIndex: 0,
    });
    get().autoSaveDiagram();
  },

  resetFlow: () => {
    get()._updateHistory(createInitialDiagramState());
  },

  loadDiagram: async (roomId) => {
    if (!roomId) {
      set({ activeRoomId: null });
      return;
    }

    set({ activeRoomId: roomId });

    if (get().diagrams[roomId]) {
      return; 
    }

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await fetch(`/api/diagram/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok && response.status !== 204) {
        const { diagram_data } = await response.json();
        const safeEncodedData = diagram_data;
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
        
        get()._updateActiveDiagramState({
          nodes: data.nodes,
          edges: data.edges,
          history: [{ nodes: data.nodes, edges: data.edges }],
          historyIndex: 0,
        });

      } else {
        get()._updateActiveDiagramState(createInitialDiagramState());
      }
    } catch (error) {
      console.error("Failed to load diagram:", error);
      get()._updateActiveDiagramState(createInitialDiagramState());
    }
  },


  save: (finalFilename, chatHistory, quests, completedQuests) => {
    if (!finalFilename) {
      console.error("저장 함수가 파일 이름 없이 호출되었습니다.");
      return;
    }

    const { nodes, edges } = get();
    const diagramData = { nodes: nodes(), edges: edges() };

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
      return {
        error:
          "파일을 불러오는 데 실패했습니다. 손상되었거나 유효한 파일이 아닐 수 있습니다.",
      };
    }
  },

  
}));

export default useFlowStore;