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
      <Handle type="target" position={Position.Top} />
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={sourceHandleStyleA}
      />
      <div className={styles.card}>
        <div className={styles.title}>{data?.title}</div>
        <div className={styles.content}>{data?.text}</div>
        <a className={styles.link} href={data?.url}>
          {data?.url}
        </a>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={sourceHandleStyleB}
      />
    </>
  );
};

export default memo(CustomNode);
