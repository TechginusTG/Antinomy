import React from 'react';
import { Layout } from "antd";

import styles from "./HeaderBar.module.css";

const HeaderBar = ({ className }) => {
    return (
        <Layout.Header className={`${styles.header} ${className}`}>
            <h2>ANTINOMY</h2>
        </Layout.Header>
    );
};

export default React.memo(HeaderBar);
