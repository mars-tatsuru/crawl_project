"use client";

import { useCallback, useMemo } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Node,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ConnectionLineType,
} from "reactflow";
import CustomNode from "@/components/Flow/CustomNode";

import styles from "@/styles/Flow.module.scss";

import json from "../../backend/storage/key_value_stores/default/page_data.json";

/****************************
 *style for the box
 *****************************/
const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  // {
  //   id: "3",
  //   data: { title: "Node 3", text: "Node 3", url: "https://example.com" },
  //   position: { x: 400, y: 100 },
  //   type: "custom",
  //   className: styles.customNode,
  // },
];

/****************************
 * type of Json data
 ****************************/
type Data = {
  url: string;
  title: string;
};

type Values = Data[keyof Data][];

/**************
 * json data
 **************/
const jsonData: Data[] = json;

// create a node for each url
jsonData.forEach((data, index) => {
  const newNode = {
    id: String(index),
    data: {
      id: String(index),
      title: data.title,
      url: data.url,
    },
    position: { x: index + 300, y: index + 300 },
    type: "custom",
    className: styles.customNode,
  };
  initialNodes.push(newNode);
});

/****************************
 *style for the edges(lines)
 *****************************/
const initialEdges: Edge[] = [
  // { id: "e1-3", source: "1", target: "3" },
];

const defaultEdgeOptions = {
  animated: true,
  type: "smoothstep",
};

function Flow() {
  // Add node or box
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // Add edge or connection
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Add edge or connection
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className={styles.flow}>
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      />
    </div>
  );
}

export default Flow;
