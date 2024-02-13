import React, { memo } from "react";
import { Handle, Position } from "reactflow";

import styles from "@/styles/Custom.module.scss";

export default memo(
  ({ data, isConnectable }: { data: any; isConnectable: boolean }) => {
    return (
      <>
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: "#555" }}
          onConnect={(params) => console.log("handle onConnect", params)}
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
          type="source"
          position={Position.Right}
          id="a"
          style={{ top: 10, background: "#555" }}
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="b"
          style={{ bottom: 10, top: "auto", background: "#555" }}
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="c"
          isConnectable={isConnectable}
        />
      </>
    );
  }
);
