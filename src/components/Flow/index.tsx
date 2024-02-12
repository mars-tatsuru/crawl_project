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
} from "reactflow";
import dagre from "dagre";

import CustomNode from "@/components/Flow/CustomNode";
import styles from "@/styles/Flow.module.scss";
import json from "../../backend/storage/key_value_stores/default/page_data.json";

/****************************
 *style for the box
 *****************************/
const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [];

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
const defaultEdgeOptions = {
  animated: true,
  type: "smoothstep",
};

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
      });

      levelArrProcessed.push(`${curr.level}${count}`);
    } else {
      sideFlagArr.push(false);

      initialEdges.push({
        id: `${acc.level}->${curr.level}${count}`,
        source: `${acc.level}`,
        target: `${curr.level}${count}`,
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
    });
    levelArrProcessed.push(`${curr.level}`);
    return curr;
  }
}, initialValue);

console.log(initialEdges);

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
 *Layout by dagre
 *****************************/
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 200;
const nodeHeight = 100;

const getLayoutedElements = (
  nodes: Node[], // initialNodes
  edges: Edge[], // initialEdges
  direction = "TB"
) => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node, index) => {
    let nodeWithPosition;

    // if (node.id.length > 1) {
    //   nodeWithPosition = dagreGraph.node(String(parseInt(String(node.id)[0])));
    // } else {
    //   nodeWithPosition = dagreGraph.node(node.id);
    // }

    nodeWithPosition = dagreGraph.node(node.id);

    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  initialNodes,
  initialEdges
);

function Flow() {
  // Add node or box
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);

  // Add edge or connection
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

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

  // const onLayout = useCallback(
  //   (direction: string) => {
  //     const { nodes: layoutedNodes, edges: layoutedEdges } =
  //       getLayoutedElements(nodes, edges, direction);

  //     setNodes([...layoutedNodes]);
  //     setEdges([...layoutedEdges]);
  //   },
  //   [nodes, edges]
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
        {/* <Panel position="top-right">
          <button onClick={() => onLayout("TB")}>vertical layout</button>
          <button onClick={() => onLayout("LR")}>horizontal layout</button>
        </Panel> */}
      </ReactFlow>
    </div>
  );
}

export default Flow;
