import { memo, FC, CSSProperties } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "reactflow";

import styles from "@/styles/Custom.module.scss";

const sourceHandleStyleA: CSSProperties = { left: 50 };
const sourceHandleStyleB: CSSProperties = {
  right: 50,
  left: "auto",
};

const CustomNode: FC<NodeProps> = ({ data, xPos, yPos }) => {
  return (
    <>
      <NodeResizer />
      {/* {data.sideFlag ? (
        <>
          <Handle type="source" position={Position.Left} />
          <Handle type="target" position={Position.Right} />
        </>
      ) : (
        <>
          <Handle type="source" position={Position.Top} />
          <Handle type="target" position={Position.Bottom} />
        </>
      )} */}

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
