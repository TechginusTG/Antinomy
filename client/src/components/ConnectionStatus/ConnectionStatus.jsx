import React, { useState, useEffect } from "react";
import { Tooltip } from "antd";
import styles from "./ConnectionStatus.module.css";

const ConnectionStatus = () => {
  const [serverState, setServerState] = useState({
    isConnected: false,
    message: "Connecting...",
  });
  const [dbState, setDbState] = useState({
    isConnected: false,
    message: "Connecting...",
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/status");
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }
        const { server, database } = await response.json();
        setServerState({
          isConnected: server.isConnected,
          message: "Server Connected",
        });
        setDbState(database);

        if (database.isConnected) {
          console.log(database.message);
        } else {
          console.error(database.message);
        }
      } catch (error) {
        console.error("Failed to fetch status:", error);
        setServerState({ isConnected: false, message: "Server Disconnected" });
        const dbErrorState = { isConnected: false, message: "DB status unknown" };
        setDbState(dbErrorState);
        console.error(dbErrorState.message);
      }
    };

    fetchStatus(); // Initial fetch
    const intervalId = setInterval(fetchStatus, 30000); // Fetch every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // Overall status is connected only if both server and DB are connected
  const isFullyConnected = serverState.isConnected && dbState.isConnected;

  const tooltipContent = (
    <div>
      <div>
        채팅 서버에 {serverState.isConnected ? "연결됨" : "연결되지 않음"}
      </div>
      <div>
        데이터베이스에 {dbState.isConnected ? "연결됨" : "연결되지 않음"}
      </div>
    </div>
  );

  return (
    <Tooltip title={tooltipContent}>
      <div
        className={`${styles.statusIndicator} ${
          isFullyConnected ? styles.connected : styles.disconnected
        }`}
        aria-label={`Status: ${
          isFullyConnected ? "Fully Connected" : "Connection Issue"
        }`}
      />
    </Tooltip>
  );
};

export default ConnectionStatus;
