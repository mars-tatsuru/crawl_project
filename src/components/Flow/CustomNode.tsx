import { memo, FC, CSSProperties } from "react";
import { Handle, Position, NodeProps, useNodeId, NodeResizer } from "reactflow";
import Image from "next/image";

import styles from "@/styles/Custom.module.scss";

const foldUpCard = (e: any) => {
  e.stopPropagation();
  e.preventDefault();

  // closest method to find the closest ancestor with the specific class
  const dom = e.target.closest(".react-flow__node-custom");

  // If no such element is found, exit the function
  if (!dom) {
    return;
  }

  // Assuming the data-id is stored as a data attribute
  const nodeId = dom.getAttribute("data-id");

  // Get all elements with the specific class
  const allNodes = document.querySelectorAll(".react-flow__node-custom");
  let nodeArray: any[] = [];
  let nodePosition: any[] = [];

  allNodes.forEach((node) => {
    // Get the data-id attribute of each node
    const currentId = node.getAttribute("data-id");

    if (currentId?.includes(nodeId)) {
      // Toggle the 'folded' class for the clicked node
      nodeArray.push(node);
      // nodePosition.push(node.getBoundingClientRect());
    } else {
      return;
    }
  });

  // get node style
  nodeArray.map((node) => {
    console.log(node.style.transform);
    nodePosition.push(node.style.transform);
  });

  // change node style to nodePosition[0] value
  nodeArray.map((node) => {
    node.style.transform = nodePosition[0];
  });
};

function NodeIdDisplay() {
  const nodeId = useNodeId();

  return (
    // <span className={styles.nodeId} onClick={foldUpCard}>
    <span className={styles.nodeId}>{nodeId}</span>
  );
}

const CustomNode: FC<NodeProps> = ({ data, isConnectable }) => {
  return (
    <>
      {/* <NodeResizer /> */}
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Top} id="top" />
      <div className={styles.card}>
        <NodeIdDisplay />
        {data?.thumbnailPath && (
          <div className={styles.imageContainer}>
            <Image
              className={styles.image}
              src={data?.thumbnailPath}
              fill={true}
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={true}
              style={{ objectFit: "contain" }}
              alt="thumbnail"
            />
          </div>
        )}
        <div className={styles.title}>{data?.title}</div>
        <div className={styles.content}>Level: {data?.level}</div>
        {data?.url && data?.thumbnailPath && (
          <a className={styles.link} href={data?.url} target="_blank">
            {data?.url}
          </a>
        )}
      </div>
    </>
  );
};

export default memo(CustomNode);
