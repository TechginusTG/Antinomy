import React from "react";
import { Layout, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import ConnectionStatus from "../ConnectionStatus/ConnectionStatus";
import styles from "./HeaderBar.module.css";
import logo from "../../assets/img/logo.png"; // Adjust the path as necessary
import useFlowStore from "../../utils/flowStore";

const HeaderBar = ({ className, toggleSider }) => {
  const theme = useFlowStore((state) => state.theme);

  return (
    <Layout.Header className={`${styles.header} ${className}`}>
      <Button
        className={styles.menuButton}
        icon={<MenuOutlined />}
        onClick={toggleSider}
      />
      <div className={styles.titleContainer}>
        <img 
          src={logo} 
          alt="Antinomy Logo" 
          className={`${styles.logo} ${theme === 'dark' ? styles.darkThemeLogo : ''}`} 
        />
        <h2 className={styles.title}>ANTINOMY</h2>
        <ConnectionStatus />
      </div>
    </Layout.Header>
  );
};

export default React.memo(HeaderBar);
