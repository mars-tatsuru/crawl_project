import { memo, FC, CSSProperties } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "reactflow";
import Image from "next/image";

import styles from "@/styles/Custom.module.scss";

const CustomNode: FC<NodeProps> = ({ data, isConnectable }) => {
  return (
    <>
      {/* <NodeResizer /> */}
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Top} id="top" />
      <div className={styles.card}>
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
