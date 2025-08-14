smport { create } from "zustand";
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
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    return {
      ...newState,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    };
  },

  onNodesChange: (changes) => {
    const { nodes, edges, _updateHistory } = get();
    const nextNodes = applyNodeChanges(changes, nodes);
    const isDragging = changes.some((c) => c.type === "position" && c.dragging);
    if (isDragging) {
      set({ nodes: nextNodes });
    } else {
      set(_updateHistory({ nodes: nextNodes, edges }));
    }
  },

  onEdgesChange: (changes) => {
    const { nodes, edges, _updateHistory } = get();
    const nextEdges = applyEdgeChanges(changes, edges);
    set(_updateHistory({ nodes, edges: nextEdges }));
  },

  onConnect: (connection) => {
    const { nodes, edges, _updateHistory } = get();
    const nextEdges = addEdge(connection, edges);
    set(_updateHistory({ nodes, edges: nextEdges }));
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

  save: (finalFilename) => {
    if (!finalFilename) {
      console.error("Save function called without a filename.");
      return;
    }

    const { nodes, edges } = get();
    const flowData = { nodes, edges };
    const jsonString = JSON.stringify(flowData);

    // Keep the URL hash update logic for sharing
    const compressed = pako.deflate(jsonString);
    const base64 = btoa(String.fromCharCode.apply(null, compressed));
    const safeEncodedData = base64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    window.location.hash = `data=${safeEncodedData}`;

    // Save to file using the new filename
    const blob = new Blob([JSON.stringify(flowData, null, 2)], {
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

  loadFromHash: () => {
    try {
      if (!window.location.hash.startsWith("#data=")) return;

      const safeEncodedData = window.location.hash.substring(6); // #data= is 6 chars

      // Convert from URL/filename safe Base64 back to standard Base64
      let base64 = safeEncodedData.replace(/-/g, "+").replace(/_/g, "/");
      // Add padding back for correct decoding
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
      window.history.replaceState(null, null, " ");
    } catch (error) {
      console.error("Failed to load from URL hash:", error);
      window.location.hash = ""; // Clear invalid hash
    }
  },
}));

export default useFlowStore;
