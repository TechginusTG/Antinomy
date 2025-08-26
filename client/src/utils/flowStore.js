import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";

import chatService from "./chatService";
import { getUnlockedThemes } from "./themeManager";
import { saveChatLog } from "./chatStorage";

const initialNodes = [
  {
    id: "1",
    type: "custom",
    position: { x: 100, y: 150 },
    data: { label: "문제" },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 200, y: 250 },
    data: { label: "과정" },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 300, y: 350 },
    data: { label: "해결" },
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
    isSettingsOpen: false,
    isQuestOpen: false,
    isConnected: false,
    editingNodeId: null,

    currentExp: 0,
    maxExp: 100, 
    level: 1,
    unlockedThemes: getUnlockedThemes(1),

    increaseExp: (amount) => set((state) => {
      const newExp = state.currentExp + amount;
      if (newExp >= state.maxExp) {
        const newLevel = state.level + 1;
        return {
          currentExp: newExp - state.maxExp,
          level: newLevel,
          maxExp: state.maxExp + 50,
          unlockedThemes: getUnlockedThemes(newLevel),
        };
      }
      return { currentExp: newExp };
    }),
    decreaseExp: (amount) => set((state) => ({ currentExp: Math.max(0, state.currentExp - amount) })),
    setLevel: (newLevel) => set({ level: newLevel, unlockedThemes: getUnlockedThemes(newLevel) }),

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
    setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
    setIsQuestOpen: (isOpen) => set({ isQuestOpen: isOpen }),
    setEditingNodeId: (nodeId) => set({ editingNodeId: nodeId }),

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
      const { history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newState);
      const stateToSet = {
        ...newState,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
      set(stateToSet);
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

    addNode: (position) => {
      const { nodes, edges, _updateHistory } = get();
      const newNodeId =
        (nodes.length > 0 ? Math.max(...nodes.map((n) => parseInt(n.id))) : 0) +
        1;
      const newNode = {
        id: newNodeId.toString(),
        type: "custom",
        position,
        data: { label: "New Node" },
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

      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextState = history[historyIndex + 1];
        set({ ...nextState, historyIndex: historyIndex + 1 });

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

    loadFlow: () => {
      get().resetFlow();
      return null;
    },

    deleteMessage: (messageId, setChatLog) => {
      const chatLogString = localStorage.getItem("chatLog");
      let chatHistory = chatLogString ? JSON.parse(chatLogString) : [];
      const messageIndex = chatHistory.findIndex((msg) => msg.id === messageId);
      
      if (messageIndex > -1) {
        chatHistory.splice(messageIndex);
        saveChatLog(chatHistory);
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
        saveChatLog(chatHistory);


        chatService.resubmit(chatHistory, (reply) => {
          const newChatLog = [
            ...chatHistory,
            { id: Date.now(), sender: "ai", content: reply },
          ];
          setChatLog(newChatLog);
          saveChatLog(newChatLog);

        });
      }
    }
  };
});

export default useFlowStore;
