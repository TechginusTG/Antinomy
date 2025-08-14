import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "reactflow";
import pako from "pako";

const initialNodes = [
  { id: "1", position: { x: 100, y: 100 }, data: { label: "Hello" } },
  { id: "2", position: { x: 200, y: 200 }, data: { label: "World" } },
];
const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const useFlowStore = create((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  history: [{ nodes: initialNodes, edges: initialEdges }],
  historyIndex: 0,

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

  autoSaveToHash: () => {
    const { nodes, edges } = get();
    const diagramData = { nodes, edges };
    const diagramJsonString = JSON.stringify(diagramData);
    const compressed = pako.deflate(diagramJsonString);
    const base64 = btoa(String.fromCharCode.apply(null, compressed));
    const safeEncodedData = base64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    const hash = `#data=${safeEncodedData}`;
    window.history.replaceState(null, null, hash);
    localStorage.setItem("flow-hash", hash);
  },

  onNodesChange: (changes) => {
    const { nodes, edges, _updateHistory } = get();
    const nextNodes = applyNodeChanges(changes, nodes);
    const isDragging = changes.some((c) => c.type === "position" && c.dragging);
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
        return;
      }
    }

    try {
      if (!hash.startsWith("#data=")) return;

      const safeEncodedData = hash.substring(6);

      let base64 = safeEncodedData.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) {
        base64 += "=";
      }

      const decodedData = atob(base64);
      const compressed = new Uint8Array(decodedData.length).map((_, i) =>
        decodedData.charCodeAt(i)
      );
      const jsonString = pako.inflate(compressed, { to: "string" });
      const flowData = JSON.parse(jsonString);

      get().setFlow(flowData);
    } catch (error) {
      console.error("Failed to load from hash:", error);
      window.location.hash = "";
      localStorage.removeItem("flow-hash");
    }
  },
}));

export default useFlowStore;
