import { memo, FC, CSSProperties } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "reactflow";

import styles from "@/styles/Custom.module.scss";

const CustomNode: FC<NodeProps> = ({ data, isConnectable }) => {
  return (
    <>
      <NodeResizer />
      <Handle
        id="a"
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Handle
        id="b"
        type="source"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Handle
        id="c"
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        id="d"
        type="source"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <div className={styles.card}>
        <div className={styles.title}>{data?.title}</div>
        <div className={styles.content}>{data?.level}</div>
        <a className={styles.link} href={data?.url} target="_blank">
          {data?.url}
        </a>
      </div>
      <Handle
        id="e"
        type="target"
        position={Position.Right}
        isConnectable={isConnectable}
      />
      <Handle
        id="f"
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
      <Handle
        id="g"
        type="target"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
      <Handle
        id="h"
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </>
  );
};

export default memo(CustomNode);
