import React from "react";
import { Layout, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import ConnectionStatus from "../ConnectionStatus/ConnectionStatus";
import styles from "./HeaderBar.module.css";

const HeaderBar = ({ className }) => {
  return (
    <Layout.Header className={`${styles.header} ${className}`}>
      <Button
        className={styles.menuButton}
        icon={<MenuOutlined />}
        onClick={toggleSider}
      />
      <div className={styles.titleContainer}>
        <h2>ANTINOMY</h2>
        <ConnectionStatus />
      </div>
    </Layout.Header>
  );
};

export default React.memo(HeaderBar);
