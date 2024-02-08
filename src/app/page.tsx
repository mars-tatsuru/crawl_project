import type { NextPage } from "next";
import Flow from "@/components/Flow/index";
import "reactflow/dist/style.css";

import styles from "@/styles/Home.module.scss";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Flow />
    </div>
  );
};

export default Home;
