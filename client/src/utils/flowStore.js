import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";
import pako from "pako";

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
    chatWidth: parseInt(localStorage.getItem("chatWidth"), 10) || 30,
    isSettingsOpen: false,
    isQuestOpen: false,
    isConnected: false,

    currentExp: 0,
    maxExp: 100, 
    level: 1,

    increaseExp: (amount) => set((state) => {
      const newExp = state.currentExp + amount;
      if (newExp >= state.maxExp) {
        return {
          currentExp: newExp - state.maxExp,
          level: state.level + 1,
          maxExp: state.maxExp + 50, 
        };
      }
      return { currentExp: newExp };
    }),
    decreaseExp: (amount) => set((state) => ({ currentExp: Math.max(0, state.currentExp - amount) })),
    setLevel: (newLevel) => set({ level: newLevel }),

    setIsConnected: (isConnected) => set({ isConnected }),
    setTheme: (theme) => {
      set({ theme });
      localStorage.setItem("theme", theme);
      document.body.setAttribute("data-theme", theme);
    },
    setChatWidth: (width) => {
      set({ chatWidth: width });
      localStorage.setItem("chatWidth", width);
    },
    setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
    setIsQuestOpen: (isOpen) => set({ isQuestOpen: isOpen }),

    _updateHistory: (newState) => {
      const { history, historyIndex, autoSaveToHash } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newState);
      const stateToSet = {
        ...newState,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
      set(stateToSet);
      autoSaveToHash();
    },

    updateUrlHash: () => {
      const { nodes, edges } = get();
      const diagramData = { nodes, edges };

      const chatLogString = localStorage.getItem("chatLog");
      const chatHistory = chatLogString ? JSON.parse(chatLogString) : [];

      const combinedData = {
        diagramData,
        chatHistory,
      };

      const jsonString = JSON.stringify(combinedData);
      const compressed = pako.deflate(jsonString);
      const base64 = btoa(String.fromCharCode.apply(null, compressed));
      const safeEncodedData = base64
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
      const hash = `#data=${safeEncodedData}`;
      window.history.replaceState(null, null, hash);
      localStorage.setItem("flow-hash", hash);
    },

    autoSaveToHash: () => {
      get().updateUrlHash();
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
      const nextEdges = addEdge(connection, edges);
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

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const prevState = history[historyIndex - 1];
        set({ ...prevState, historyIndex: historyIndex - 1 });
        get().autoSaveToHash();
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextState = history[historyIndex + 1];
        set({ ...nextState, historyIndex: historyIndex + 1 });
        get().autoSaveToHash();
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

    save: (finalFilename) => {
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

    loadFlow: () => {
      let hash = window.location.hash;
      if (!hash.startsWith("#data=")) {
        const storedHash = localStorage.getItem("flow-hash");
        if (storedHash && storedHash.startsWith("#data=")) {
          hash = storedHash;
          window.history.replaceState(null, null, hash);
        } else {
          get().resetFlow();
          return null;
        }
      }

      try {
        if (!hash.startsWith("#data=")) return null;

        const safeEncodedData = hash.substring(6);

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

        if (data.diagramData && data.chatHistory) {
          get().setFlow(data.diagramData);
          localStorage.setItem("chatLog", JSON.stringify(data.chatHistory));
          return data.chatHistory;
        } else {
          get().setFlow(data);
          return null;
        }
      } catch (error) {
        console.error("Failed to load from hash:", error);
        window.location.hash = "";
        localStorage.removeItem("flow-hash");
        get().resetFlow();
        return null;
      }
    },
  };
});

export default useFlowStore;
