"use client";

import {
  useCallback,
  useMemo,
  useEffect,
  useState,
  useLayoutEffect,
} from "react";

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
  useNodesInitialized,
  useViewport,
  Viewport,
} from "reactflow";

import Dagre from "@dagrejs/dagre";
import CustomNode from "@/components/Flow/CustomNode";
import CustomEdge from "@/components/Flow/CustomEdge";
import styles from "@/styles/Flow.module.scss";
// import tree from "../../backend/storage/key_value_stores/default/site_tree.json";
import tree from "../../backend/site_tree.json";

/************************************************
 * 1. use Darge to layout the nodes and edges
 *************************************************/
const dagreGraph = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeWidth = 172;
const nodeHeight = 300;

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

const getLayoutedElements = (nodes: any, edges: any, direction = "TB") => {
  //Dagre: https://github.com/dagrejs/dagre/wiki#an-example-layout
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({
    rankdir: direction,
    ranker: "network-simplex",
  });

  nodes.forEach((node: any) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge: any) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  Dagre.layout(dagreGraph);

  nodes.forEach((node: any) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";

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

const LayoutFlow = () => {
  // Add node or box
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // Add edge or connection
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // new click event function
  const onLayout = useCallback(
    (direction: string) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges]
  );

  //TODO: 他にも引数にnodeの名前を入れて、検索してzoomする関数を作る
  // const moveToFirstNode = useCallback(() => {
  //   const firstNode = nodes[0];
  //   const windowWidth = window.innerWidth;
  //   const windowHeight = window.innerHeight;
  //   const clientRect = firstNode?.position;

  //   if (clientRect) {
  //     setViewport(
  //       {
  //         x: -clientRect.x / 2 + windowWidth / 2,
  //         y: clientRect.y,
  //         zoom: 0.5,
  //       },
  //       { duration: 1000 }
  //     );
  //   }
  // }, [nodes]);

  /************************************************
   * 1 useEffect
   ************************************************/
  useEffect(() => {
    const { nodes: initialNodes, edges: initialEdges } = processData(tree);

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, []);

  /************************************************
   * Add edge or connection
   ************************************************/
  const onConnect = useCallback(
    (connection: any) => {
      const edge = { ...connection, type: "custom-edge" };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  /************************************************
   * HELPER FUNCTIONS
   ************************************************/
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

  // position x and y
  const { x, y, zoom } = useViewport();

  /************************************************
   * move to first node after layout
   ************************************************/
  const { setViewport } = useReactFlow();
  // listen to nodes initialized. this means all nodes have been rendered.
  const nodesInitialized = useNodesInitialized();

  useLayoutEffect(() => {
    const firstNodeTest = nodes[0];
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const clientRect = firstNodeTest?.position;

    if (clientRect) {
      // set to the first node
      setViewport(
        {
          x: -clientRect.x / 2 + windowWidth / 2,
          y: clientRect.y,
          zoom: 0.5,
        },
        { duration: 1000 }
      );
    }
  }, [nodesInitialized]);

  /************************************************
   * MAIN COMPONENT
   ************************************************/
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
      minZoom={0.01}
      fitViewOptions={{
        nodes: [
          {
            id: nodes[0]?.id,
          },
        ],
        minZoom: 1,
        maxZoom: 0.4,
      }}
      // defaultViewport={defaultViewport}
    >
      <Background style={{ background: "#333" }} />
      {/* <MiniMap nodeStrokeWidth={3} /> */}
      <Panel position="top-right">
        {/* <button style={{ marginRight: "10px" }} onClick={() => onLayout("TB")}>
          vertical layout
        </button> */}
        {/* <button onClick={() => onLayout("LR")}>horizontal layout</button> */}
        {/* <button style={{ marginRight: "10px" }} onClick={moveToFirstNode}>
          move to top level
        </button> */}
        <p>
          Current: positionX:{x}, positionY:{y}, zoom:{zoom}
        </p>
      </Panel>
      {/* <Controls /> */}
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
