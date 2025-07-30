import { Layout, Button } from "antd";

import styles from "./HeaderBar.module.css";

const HeaderBar = ({ className }) => {
    return (
        <Layout.Header className={`${styles.header} ${className}`}>
            <h2>ANTINOMY</h2>
            <Button>
                <span>Q</span>
            </Button>
        </Layout.Header>
    );
};

export default HeaderBar;
