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
} from "reactflow";

import "reactflow/dist/style.css";

import styles from "@/styles/Flow.module.scss";

const rfStyle = {
  backgroundColor: "#B8CEFF",
};

import TextUpdaterNode from "@/components/Flow/CustomNode";
import CustomEdge from "@/components/Flow/CustomEdge";

const nodeTypes = { textUpdater: TextUpdaterNode };
const edgeTypes = {
  "custom-edge": CustomEdge,
};

const initialNodes = [
  {
    id: "1",
    type: "textUpdater",
    data: {
      url: "https://www.marsflag.com/cn/",
      title: "MARS FLAG Corporation",
      level: 1,
    },
    position: { x: 0, y: 0 },
    className: styles.customNode,
  },
  {
    id: "2",
    type: "textUpdater",
    data: {
      url: "https://www.marsflag.com/ja/",
      title: "株式会社マーズフラッグ",
      level: 1,
    },
    position: { x: 300, y: 0 },
    className: styles.customNode,
  },
  {
    id: "3",
    type: "textUpdater",
    data: {
      url: "https://www.marsflag.com/zn/",
      title: "MARS FLAG Corporation",
      level: 1,
    },
    position: { x: 650, y: 0 },
    targetPosition: Position.Left,
    className: styles.customNode,
  },
  {
    id: "4",
    type: "textUpdater",
    data: {
      url: "https://www.marsflag.com/ja/contact-us/",
      title: "お問い合わせ - MARS FLAG",
      level: 2,
    },
    position: { x: 300, y: 200 },
    targetPosition: Position.Top,
    className: styles.customNode,
  },
];

const initialEdges = [
  {
    id: "1->2",
    source: "1",
    target: "2",
    sourceHandle: "c",
    targetHandle: "b",
    animated: true,
    style: { stroke: "#fff" },
  },
  {
    id: "2->3",
    source: "2",
    target: "3",
    sourceHandle: "c",
    targetHandle: "b",
    animated: true,
    style: { stroke: "#fff" },
  },
  {
    id: "2->4",
    source: "2",
    target: "4",
    sourceHandle: "d",
    targetHandle: "a",
    animated: true,
    style: { stroke: "#fff" },
  },
];

const panOnDrag = [1, 2];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: any) => {
      const edge = { ...connection, type: "custom-edge" };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const backgroundVariant = BackgroundVariant.Cross;

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
        <Panel position="top-left">top-left</Panel>
        <Panel position="top-center">top-center</Panel>
        <Panel position="top-right">top-right</Panel>
        <Panel position="bottom-left">bottom-left</Panel>
        <Panel position="bottom-center">bottom-center</Panel>
        <Panel position="bottom-right">bottom-right</Panel>
        <Controls />
        <MiniMap />
        <Background variant={backgroundVariant} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
