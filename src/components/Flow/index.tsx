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

type Values = Data[keyof Data][];

/******************************************
 * processing json data
 ******************************************/
const jsonData: Data[] = json;
// const levelObj: { [key: string]: Values } = {};

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

const levelArr = initialNodes.map((element) => {
  return element.data.level;
});

// levelArr = [1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3];
levelArr.sort((a, b) => a - b);

// [1, 2, 21, 22, 23, 3, 31, 32, 33, 34, 35];
const levelArrProcessed: string[] = [];
/****************************
 * style for the edges(lines)
 *****************************/
const defaultEdgeOptions = {
  animated: true,
  type: "smoothstep",
};

const initialEdges: Edge[] = [
  // { id: "1->2", source: "1", target: "2" },
  // { id: "1->21", source: "1", target: "21" },
  // { id: "1->22", source: "1", target: "22" },
  // { id: "1->23", source: "1", target: "23" },
  // { id: "1->3", source: "2", target: "3" },
  // { id: "2->31", source: "2", target: "31" },
  // { id: "2->32", source: "2", target: "32" },
  // { id: "2->33", source: "2", target: "33" },
  // { id: "2->34", source: "2", target: "34" },
  // { id: "2->35", source: "2", target: "35" },
  // { id: "2->36", source: "2", target: "36" },
];

const initialValue = 0;
let count = 1;
// create edges based on the levelArr
levelArr.reduce((acc, curr, index, arr) => {
  if (index === 0) {
    levelArrProcessed.push(`${curr}`);
    return curr;
  }
  if (curr === acc) {
    if (arr[index - 2] && curr !== arr[index - 2]) {
      count = 1;
    }
    initialEdges.push({
      id: `${acc - 1}->${curr}${count}`,
      source: `${acc - 1}`,
      target: `${curr}${count}`,
    });
    levelArrProcessed.push(`${curr}${count}`);
    count++;
    return curr;
  } else {
    initialEdges.push({
      id: `${acc}->${curr}`,
      source: `${acc}`,
      target: `${curr}`,
    });
    levelArrProcessed.push(`${curr}`);
    return curr;
  }
}, initialValue);

// sort initialNodes by id in decreasing order
initialNodes.sort((a, b) => {
  return a.data.level - b.data.level;
});

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
