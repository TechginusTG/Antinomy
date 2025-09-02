
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

export const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const avgWidth = nodes.reduce((acc, node) => {
    let width = nodeWidth;
    if (node.data.shape === 'ellipse' || node.data.shape === 'diamond') {
      width = 100;
    }
    return acc + width;
  }, 0) / nodes.length;

  const avgHeight = nodes.reduce((acc, node) => {
    let height = nodeHeight;
    if (node.data.shape === 'ellipse' || node.data.shape === 'diamond') {
      height = 100;
    }
    return acc + height;
  }, 0) / nodes.length;

  dagreGraph.setGraph({ rankdir: direction, nodesep: avgWidth * 1.5, ranksep: avgHeight * 1.5 });

  nodes.forEach((node) => {
    let width = nodeWidth;
    let height = nodeHeight;
    if (node.data.shape === 'ellipse' || node.data.shape === 'diamond') {
      width = 100;
      height = 100;
    }
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    if (node.data.shape !== 'diamond') {
      node.targetPosition = 'top';
      node.sourcePosition = 'bottom';
    }

    let width = nodeWidth;
    let height = nodeHeight;
    if (node.data.shape === 'ellipse' || node.data.shape === 'diamond') {
      width = 100;
      height = 100;
    }

    // We are shifting the dagre node position (anchor=center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - width / 2,
      y: nodeWithPosition.y - height / 2,
    };
  });

  return { nodes, edges };
};
