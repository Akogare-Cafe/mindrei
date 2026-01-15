"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  BackgroundVariant,
} from "../../node_modules/reactflow/dist/esm";
import "reactflow/dist/style.css";
import { MindMapNode } from "./mind-map-node";

interface MindMapData {
  nodes: Array<{
    _id: string;
    label: string;
    content?: string;
    positionX: number;
    positionY: number;
    color?: string;
    level: number;
  }>;
  edges: Array<{
    _id: string;
    sourceId: string;
    targetId: string;
    label?: string;
  }>;
}

interface MindMapCanvasProps {
  data: MindMapData;
  onNodeClick?: (nodeId: string) => void;
  onNodeUpdate?: (nodeId: string, data: { label?: string; content?: string }) => void;
}

const nodeTypes = {
  mindMapNode: MindMapNode,
};

const levelColors = [
  "#a78bfa",
  "#22d3ee",
  "#4ade80",
  "#fbbf24",
  "#f87171",
];

export function MindMapCanvas({
  data,
  onNodeClick,
  onNodeUpdate,
}: MindMapCanvasProps) {
  const initialNodes: Node[] = useMemo(
    () =>
      data.nodes.map((node) => ({
        id: node._id,
        type: "mindMapNode",
        position: { x: node.positionX, y: node.positionY },
        data: {
          label: node.label,
          content: node.content,
          color: node.color || levelColors[node.level % levelColors.length],
          level: node.level,
          onClick: () => onNodeClick?.(node._id),
          onUpdate: (updates: { label?: string; content?: string }) =>
            onNodeUpdate?.(node._id, updates),
        },
      })),
    [data.nodes, onNodeClick, onNodeUpdate]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      data.edges.map((edge) => ({
        id: edge._id,
        source: edge.sourceId,
        target: edge.targetId,
        label: edge.label,
        type: "smoothstep",
        animated: false,
        style: { stroke: "#64748b", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#64748b",
        },
      })),
    [data.edges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full min-h-[500px] bg-background rounded-lg border border-border overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "smoothstep",
          animated: false,
        }}
      >
        <Controls className="bg-card border border-border rounded-lg" />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#334155"
        />
      </ReactFlow>
    </div>
  );
}
