"use client";

import { useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Panel,
  Node,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ConnectionLineType,
  Position,
  Background,
  Controls,
  BackgroundVariant,
  MiniMap,
} from "reactflow";
import dagre from "dagre";

import CustomNode from "@/components/Flow/CustomNode";
import CustomEdge from "@/components/Flow/CustomEdge";
import styles from "@/styles/Flow.module.scss";
import tree from "../../backend/storage/key_value_stores/default/site_tree.json";

type Data = {
  url: string;
  title: string;
  level: number;
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

type TreeNode = {
  url: string;
  title: string;
  level: number;
  x: number;
  y: number;
  [key: string]: any; // To include children nodes
};

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  "custom-edge": CustomEdge,
};

const defaultEdgeOptions = {
  animated: false,
};

// Assuming TreeNode, Node, and Edge types are already defined
// 5-1
const createNode = (id: string, value: TreeNode, parentId?: string): Node => ({
  id,
  type: "custom",
  position: { x: value.x, y: value.y },
  data: { title: value.title, level: value.level, url: value.url },
});

// 5-2
const createEdge = (sourceId: string, targetId: string): Edge => ({
  id: `${sourceId}-${targetId}`,
  source: sourceId,
  target: targetId,
  ...defaultEdgeOptions,
});

// 3
const processData = (data: { [key: string]: TreeNode }, parentId?: string) => {
  let nodes: Node[] = [];
  let edges: Edge[] = [];

  // 5
  const processEntry = (key: string, value: TreeNode, processId?: string) => {
    const nodeId = processId ? `${processId}-${key}` : `${key}`;
    nodes.push(createNode(nodeId, value, processId));

    if (processId) {
      edges.push(createEdge(`${processId}`, `${processId}-${key}`));
    }

    // Recursively process children
    Object.entries(value).map(([childKey, childValue]) => {
      if (!["url", "title", "level", "x", "y"].includes(childKey)) {
        // 6 Recursion
        const childProcessResult = processData(
          { [childKey]: childValue },
          nodeId
        );

        nodes = nodes.concat(childProcessResult.nodes);
        edges = edges.concat(childProcessResult.edges);
      }
    });
  };

  // 4
  Object.entries(data).map(([key, value]) => {
    processEntry(key, value, parentId);
  });

  return { nodes, edges };
};

function Flow() {
  // Add node or box
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // Add edge or connection
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 1
  useEffect(() => {
    // 2
    const { nodes: initialNodes, edges: initialEdges } = processData(tree);

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  // Add edge or connection
  // const onConnect = useCallback(
  //   (params: Connection | Edge) =>
  //     setEdges((eds) =>
  //       addEdge(
  //         { ...params, type: ConnectionLineType.SmoothStep, animated: true },
  //         eds
  //       )
  //     ),
  //   []
  // );

  // add edge or connection
  const onConnect = useCallback(
    (connection: any) => {
      const edge = { ...connection, type: "custom-edge" };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  return (
    <div className={styles.flow}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
      >
        <Background style={{ background: "#222" }} />
      </ReactFlow>
    </div>
  );
}

export default Flow;
