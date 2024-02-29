"use client";

import React, { useCallback, useState, useMemo, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Panel,
  SelectionMode,
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

// TODO: siteMapData is the tree structure of the site
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

  const onConnect = useCallback(
    (connection: any) => {
      const edge = { ...connection, type: "custom-edge" };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
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
        panOnScroll
        selectionOnDrag
        panOnDrag={panOnDrag}
        selectionMode={SelectionMode.Partial}
        nodeTypes={nodeTypes}
        fitView
        style={rfStyle}
        edgeTypes={edgeTypes}
      >
        <Background style={{ background: "#bbdbf3" }} />
      </ReactFlow>
    </div>
  );
}
