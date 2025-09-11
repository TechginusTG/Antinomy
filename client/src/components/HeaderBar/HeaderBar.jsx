import React from "react";
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Popover } from "antd";
import { MenuOutlined, UserOutlined, MessageOutlined } from "@ant-design/icons";
import ConnectionStatus from "../ConnectionStatus/ConnectionStatus";
import styles from "./HeaderBar.module.css";
import logo from "../../assets/img/logo.png"; // Adjust the path as necessary
import useFlowStore from "../../utils/flowStore";

const HeaderBar = ({ className, toggleSider, toggleChatRoomPanel, authStatus, onLogout }) => {
  const theme = useFlowStore((state) => state.theme);
  const setIsProfileModalOpen = useFlowStore((state) => state.setIsProfileModalOpen);
  const navigate = useNavigate();

  const handleAuthActionClick = () => {
    if (onLogout) {
      onLogout(); 
    }
    navigate('/'); 
  };

  const teamInfoContent = (
    <div>
      <p>
        <strong>Blog:</strong>{" "}
        <a
          href="https://cinqro.tistory.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://cinqro.tistory.com/
        </a>
      </p>
      <p>
        <strong>GitHub:</strong>{" "}
        <a
          href="https://github.com/TechginusTG"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://github.com/TechginusTG
        </a>
      </p>
    </div>
  );

  return (
    <Layout.Header className={`${styles.header} ${className}`}>
      <div className={styles.leftSection}>
        <Button
          className={styles.menuButton}
          icon={<MenuOutlined />}
          onClick={toggleSider}
        />
        <Button
          className={styles.menuButton}
          icon={<MessageOutlined />}
          onClick={toggleChatRoomPanel}
        />
        <img
          src={logo}
          alt="Antinomy Logo"
          className={`${styles.logo} ${
            theme === "dark" ? styles.darkTheme : ""
          }`}
        />
        <h2 className={styles.title}>ANTINOMY</h2>
        <ConnectionStatus />
        {authStatus === 'loggedIn' && (
          <Button onClick={() => setIsProfileModalOpen(true)} className={styles.authButton}>
            <UserOutlined /> Profile
          </Button>
        )}
        {authStatus === 'guest' && (
          <Button onClick={handleAuthActionClick} className={styles.authButton}>
            Log In
          </Button>
        )}
      </div>
      <div className={styles.rightSection}>
        <Popover
          content={teamInfoContent}
          title="Team TechGinus"
          trigger="click"
          placement="bottomRight"
        >
          <p className={styles.teamInfo}>Made by TeamTechGinus</p>
        </Popover>
      </div>
    </Layout.Header>
  );
};

export default React.memo(HeaderBar);
