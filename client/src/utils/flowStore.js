import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow';

const initialNodes = [{ id: '1', position: { x: 10, y: 10 }, data: { label: 'Hello' } }, { id: '2', position: { x: 10, y: 100 }, data: { label: 'World' } }];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

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

    // Check if the change is just a node drag
    const isDragging = changes.some((c) => c.type === 'position' && c.dragging);

    if (isDragging) {
      // If dragging, only update the nodes without adding to history
      set({ nodes: nextNodes });
    } else {
      // Otherwise, update the history
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
}));

export default useFlowStore;