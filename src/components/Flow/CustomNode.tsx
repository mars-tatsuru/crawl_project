import React, { memo } from "react";
import { Handle, Position } from "reactflow";

import styles from "@/styles/Custom.module.scss";

export default memo(
  ({ data, isConnectable }: { data: any; isConnectable: boolean }) => {
    return (
      <>
        <Handle
          id="a"
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
        />
        <Handle
          id="b"
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
        />
        <div className={styles.card}>
          <p className={styles.title}>{data.title}</p>
          <p className={styles.content}>{data.level}</p>
          <a href="/" className={styles.link}>
            {data.url}
          </a>
        </div>
        <Handle
          id="c"
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
        />
        <Handle
          id="d"
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
        />
      </>
    );
  }
);
