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
} from "reactflow";
import dagre from "dagre";

import CustomNode from "@/components/Flow/CustomNode";
import styles from "@/styles/Flow.module.scss";
import json from "../../backend/storage/key_value_stores/default/page_data.json";
import CustomEdge from "@/components/Flow/CustomEdge";

/****************************
 *style for the box
 *****************************/
const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [];

const edgeTypes = {
  "custom-edge": CustomEdge,
};

/****************************
 * type of Json data
 ****************************/
type Data = {
  url: string;
  title: string;
  level: number;
};

type LevelAndUrl<T extends Data> = {
  level: T["level"];
  url: T["url"];
};

/******************************************
 * processing json data
 ******************************************/
const jsonData: Data[] = json;

// sorting the data by level
jsonData.sort((a, b) => a.level - b.level);

const levelAndUrlArr: LevelAndUrl<Data>[] = jsonData.map((data) => {
  return { level: data.level, url: data.url };
});

const levelArrProcessed: string[] = [];
/********************************************************
 * style for the edges(lines)
 ********************************************************/
const initialEdges: Edge[] = [];

// const initialValue = 0;
const initialValue = {
  level: 0,
  url: "",
};
let count = 1;
let sideFlagArr: boolean[] = [];

// almost success. but not convinced.
levelAndUrlArr.reduce((acc, curr, index, arr) => {
  if (index === 0) {
    // not empty string
    initialEdges.push({
      id: `${index}`,
      source: "0",
      target: "0",
      type: "custom-edge",
    });

    // first level url is stored as is
    levelArrProcessed.push(`${curr.level}`);

    sideFlagArr.push(true);

    return curr;
  }

  // if the level is the same as the previous level
  if (acc.level === curr.level) {
    // if the level is the same as the previous level and the level before the previous level
    if (arr[index - 2] && curr.level !== arr[index - 2].level) {
      count = 1;
    }

    if (parseInt(String(curr.level)) === parseInt(String(acc.level))) {
      sideFlagArr.push(true);

      initialEdges.push({
        id: `${acc.level}->${curr.level}${count}`,
        source: `${acc.level}`,
        target: `${curr.level}${count}`,
        type: "custom-edge",
      });

      levelArrProcessed.push(`${curr.level}${count}`);
    } else {
      sideFlagArr.push(false);

      initialEdges.push({
        id: `${acc.level}->${curr.level}${count}`,
        source: `${acc.level}`,
        target: `${curr.level}${count}`,
        type: "custom-edge",
      });

      levelArrProcessed.push(`${curr.level}${count}`);
    }

    count++;

    return curr;
  } else {
    initialEdges.push({
      id: `${acc.level}->${curr.level}`,
      source: `${acc.level}`,
      target: `${curr.level}`,
      type: "custom-edge",
    });
    levelArrProcessed.push(`${curr.level}`);
    return curr;
  }
}, initialValue);

/******************************************
 *  create a node for each url
 ******************************************/
jsonData.forEach((data, index) => {
  const newNode = {
    id: `${levelArrProcessed[index]}`,
    data: {
      id: `${index + 1}`,
      title: data.title,
      url: data.url,
      level: data.level,
      sideFlag: sideFlagArr[index],
    },
    position: {
      x: 0,
      y: 0,
    },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    type: "custom",
    className: styles.customNode,
  };
  initialNodes.push(newNode);
});

/****************************
 *Layout
 *****************************/

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = { ...connection, type: "custom-edge" };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      edgeTypes={edgeTypes}
      fitView
    />
  );
}

export default Flow;
