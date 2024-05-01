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
  ControlButton,
  useReactFlow,
} from "reactflow";

import Dagre from "@dagrejs/dagre";
import CustomNode from "@/components/Flow/CustomNode";
import CustomEdge from "@/components/Flow/CustomEdge";
import styles from "@/styles/Flow.module.scss";
import tree from "../../backend/storage/key_value_stores/default/site_tree.json";

/************************************************
 * 1. use Darge to layout the nodes and edges
 *************************************************/

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

type Data = {
  url: string;
  title: string;
  level: number;
};

type TreeNode = {
  url?: string;
  title?: string;
  level?: number;
  x?: number;
  y?: number;
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

const getLayoutedElements = (
  nodes: any[],
  edges: any[],
  options: { direction: any }
) => {
  g.setGraph({ rankdir: options.direction });

  edges.map((edge) => g.setEdge(edge.source, edge.target));
  nodes.map((node) => {
    g.setNode(node.id, node);
  });

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const { x, y } = g.node(node.id);

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

const LayoutFlow = () => {
  const { fitView } = useReactFlow();

  // Add node or box
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // Add edge or connection
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 1
  useEffect(() => {
    // 2
    const { nodes: initialNodes, edges: initialEdges } = processData(tree);

    console.log(initialNodes);

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  // add edge or connection
  const onConnect = useCallback(
    (connection: any) => {
      const edge = { ...connection, type: "custom-edge" };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  //5-1: Assuming TreeNode, Node, and Edge types are already defined
  const createNode = (
    id: string,
    value: TreeNode,
    parentId?: string
  ): Node => ({
    id,
    type: "custom",
    position: { x: value.x!, y: value.y! },
    data: {
      title: value.title,
      level: value.level,
      url: value.url,
      thumbnailPath: value.thumbnailPath,
    },
  });

  // 5-2
  // TODO: refactor this function because it is wrong.
  const createEdge = (sourceId: string, targetId: string): Edge => ({
    id: `${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    ...defaultEdgeOptions,
  });

  // 3
  const processData = (
    data: { [key: string]: TreeNode },
    parentId?: string
  ) => {
    let nodes: Node[] = [];
    let edges: Edge[] = [];

    // 5
    const processEntry = (key: string, value: TreeNode, processId?: string) => {
      const nodeId = processId ? `${processId}-${key}` : `${key}`;

      if (value.url) {
        nodes.push(createNode(nodeId, value, processId));
      }

      if (processId) {
        edges.push(createEdge(`${processId}`, `${processId}-${key}`));
      }

      // Recursively process children
      Object.entries(value).map(([childKey, childValue]) => {
        if (
          !["url", "title", "thumbnailPath", "level", "x", "y"].includes(
            childKey
          )
        ) {
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

  // new click event function
  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: initialNodes, edges: initialEdges } = processData(tree);

      const layouted = getLayoutedElements(nodes, edges, { direction });

      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);

      window.requestAnimationFrame(() => {
        fitView();
      });
    },
    [nodes, edges]
  );

  return (
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
      {/* <Panel position="bottom-center">bottom-center</Panel> */}
      {/* <MiniMap nodeStrokeWidth={3} /> */}
      <Panel position="top-right">
        <button onClick={() => onLayout("TB")}>vertical layout</button>
        <button onClick={() => onLayout("LR")}>horizontal layout</button>
      </Panel>
      <Controls />
    </ReactFlow>
  );
};

function Flow() {
  return (
    <div className={styles.flow}>
      <ReactFlowProvider>
        <LayoutFlow />
      </ReactFlowProvider>
    </div>
  );
}

export default Flow;
