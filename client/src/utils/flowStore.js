
import { create } from 'zustand';
import { addEdge } from 'reactflow';

const useFlowStore = create((set, get) => ({
  nodes: [{ id: '1', position: { x: 300, y: 200 }, data: { label: 'Hello' } }, { id: '2', position: { x: 400, y: 300 }, data: { label: 'World' } }],
  edges: [{ id: 'e1-2', source: '1', target: '2' }],
  history: [],
  historyIndex: -1,

  setNodes: (nodes) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: get().nodes, edges: get().edges });
    set({ nodes, history: newHistory, historyIndex: newHistory.length - 1 });
  },

  setEdges: (edges) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: get().nodes, edges: get().edges });
    set({ edges, history: newHistory, historyIndex: newHistory.length - 1 });
  },

  onNodesChange: (changes) => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes, edges });
    
    const nextNodes = changes.reduce((acc, change) => {
      // You might need a more sophisticated way to apply changes depending on the change type
      if (change.type === 'select' || change.type === 'dimensions') {
        return acc.map(node => node.id === change.id ? {...node, ...change} : node);
      }
      // For this example, we'll just handle position changes
      if (change.type === 'position') {
        return acc.map(node => node.id === change.id ? {...node, position: change.position} : node);
      }
      if (change.type === 'remove') {
        return acc.filter(node => node.id !== change.id);
      }
      return acc;
    }, nodes);

    set({ nodes: nextNodes, history: newHistory, historyIndex: newHistory.length - 1 });
  },

  onEdgesChange: (changes) => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes, edges });

    const nextEdges = changes.reduce((acc, change) => {
      if (change.type === 'remove') {
        return acc.filter(edge => edge.id !== change.id);
      }
      return acc;
    }, edges);

    set({ edges: nextEdges, history: newHistory, historyIndex: newHistory.length - 1 });
  },

  onConnect: (connection) => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes, edges });
    set({
      edges: addEdge(connection, edges),
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevState = history[historyIndex -1];
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
}));

export default useFlowStore;
