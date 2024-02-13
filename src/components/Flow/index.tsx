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
import json from "../../backend/storage/key_value_stores/default/page_data.json";
import tree from "../../backend/storage/key_value_stores/default/page_tree.json";

/****************************
 *style for the box
 *****************************/
const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [];
const treeArr: string[] = [];

// create a tree array
for (const [key, value] of Object.entries(tree)) {
}

console.log(treeArr);

/****************************
 * type of Json data
 ****************************/
type Data = {
  url: string;
  title: string;
};

type LevelAndUrl<T extends Data> = {
  url: T["url"];
};

/******************************************
 * processing json data
 ******************************************/
const jsonData: Data[] = json;
const levelArrProcessed: string[] = [];
/********************************************************
 * style for the edges(lines)
 ********************************************************/
const defaultEdgeOptions = {
  animated: true,
  type: "smoothstep",
};

const initialEdges: Edge[] = [];

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
