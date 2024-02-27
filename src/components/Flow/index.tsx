"use client";

import { useCallback, useMemo } from "react";
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
import styles from "@/styles/Flow.module.scss";
import tree from "../../backend/storage/key_value_stores/default/site_tree.json";

/****************************
 *style for the box
 *****************************/
const nodeTypes = {
  custom: CustomNode,
};
/****************************
 * type of Json data
 ****************************/
type Data = {
  url: string;
  title: string;
  level: number;
};

/******************************************
 * processing json data
 ******************************************/
const siteMapData: any = tree;

/********************************************************
 * style for the edges(lines)
 ********************************************************/
const defaultEdgeOptions = {
  animated: true,
  type: "smoothstep",
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// siteMapData is the tree structure of the site
let idCounter = 0;
for (const [key, value] of Object.entries(siteMapData)) {
  initialNodes.push({
    id: `${idCounter + 1}`,
    type: "custom",
    position: {
      x: idCounter * 170,
      y: ((value as { level: number } | undefined)?.level ?? 0) * 200,
    },
    data: {
      title: (value as { title: string } | undefined)?.title,
      url: (value as { url: string } | undefined)?.url,
      level: (value as { level: number } | undefined)?.level,
    },
  });

  idCounter++;
}

function Flow() {
  // Add node or box
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // Add edge or connection
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Add edge or connection
  const onConnect = useCallback(
    (params: Connection | Edge) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds
        )
      ),
    []
  );

  // const onConnect = useCallback(
  //   (connection: any) => {
  //     const edge = { ...connection, type: "custom-edge" };
  //     setEdges((eds) => addEdge(edge, eds));
  //   },
  //   [setEdges]
  // );

  return (
    <div className={styles.flow}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
      >
        <Background style={{ background: "#bbdbf3" }} />
      </ReactFlow>
    </div>
  );
}

export default Flow;
