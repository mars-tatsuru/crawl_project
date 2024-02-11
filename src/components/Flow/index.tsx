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

// create a node for each url
jsonData.forEach((data, index) => {
  const newNode = {
    id: String(index + 1),
    data: {
      title: data.title,
      url: data.url,
      level: data.level,
    },
    position: { x: 0, y: 0 },
    type: "custom",
    className: styles.customNode,
  };
  initialNodes.push(newNode);
});

const levelAndUrlArr: LevelAndUrl<Data>[] = jsonData.map((data) => {
  return { level: data.level, url: data.url };
});

const levelArrProcessed: string[] = [];
/****************************
 * style for the edges(lines)
 *****************************/
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
const firstLevelUrl = levelAndUrlArr[0].url;

// almost success. but not convinced.
levelAndUrlArr.reduce((acc, curr, index, arr) => {
  if (index === 0) {
    // not empty string
    initialEdges.push({
      id: "1",
      source: "0",
      target: "0",
    });

    // first level url is stored as is
    levelArrProcessed.push(`${curr.level}`);

    return curr;
  }

  // if the level is the same as the previous level
  if (acc.level === curr.level) {
    // if the level is the same as the previous level and the level before the previous level
    if (arr[index - 2] && curr.level !== arr[index - 2].level) {
      count = 1;
    }

    levelArrProcessed.push(`${curr.level}${count}`);

    initialEdges.push({
      id: `${acc.level}->${curr.level}${count}`,
      source: `${acc.level}`,
      target: `${curr.level}${count}`,
    });

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

// challenge :WIP
levelAndUrlArr.reduce((acc, curr, index, arr) => {
  if (index === 0) {
    // not empty string
    initialEdges.push({
      id: "1",
      source: "0",
      target: "0",
    });

    // first level url is stored as is
    levelArrProcessed.push(`${curr.level}`);

    return curr;
  }

  initialEdges.push({
    id: "1",
    source: "0",
    target: "0",
  });

  return curr;
}, initialValue);

// change the id of initialNodes to levelArrProcessed
initialNodes.map((node, index) => {
  node.id = `${levelArrProcessed[index]}`;
});

/****************************
 *Layout by dagre
 *****************************/
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 100;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
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

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // node.targetPosition = isHorizontal ? "left" : "top";
    // node.sourcePosition = isHorizontal ? "right" : "bottom";

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

  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges]
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
        connectionLineType={ConnectionLineType.SmoothStep}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
      >
        <Panel position="top-right">
          <button onClick={() => onLayout("TB")}>vertical layout</button>
          <button onClick={() => onLayout("LR")}>horizontal layout</button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default Flow;
