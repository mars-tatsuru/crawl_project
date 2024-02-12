import { memo, FC, CSSProperties } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "reactflow";

import styles from "@/styles/Custom.module.scss";

interface CustomNodeProps {
  id: string;
  data: {
    id: string;
    title: string;
    url: string;
    level: string;
    sideFlag: boolean;
  };
  position: {
    x: number;
    y: number;
  };
  targetPosition: "Left" | "Top";
  sourcePosition: "Right" | "Bottom";
  type: string;
  className: string;
}

const CustomNode: FC<CustomNodeProps> = ({ data }) => {
  return (
    <>
      <NodeResizer />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <div className={styles.card}>
        <div className={styles.title}>{data?.title}</div>
        <div className={styles.content}>{data?.level}</div>
        <a className={styles.link} href={data?.url} target="_blank">
          {data?.url}
        </a>
      </div>
    </>
  );
};

export default memo(CustomNode);
