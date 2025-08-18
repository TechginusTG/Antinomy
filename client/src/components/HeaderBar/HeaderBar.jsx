import { Layout, Button } from "antd";
import { MenuOutlined } from '@ant-design/icons';
import styles from "./HeaderBar.module.css";

const HeaderBar = ({ className, toggleSider }) => {
    return (
        <Layout.Header className={`${styles.header} ${className}`}>
            <Button className={styles.menuButton} icon={<MenuOutlined />} onClick={toggleSider} />
            <h2>ANTINOMY</h2>
        </Layout.Header>
    );
};

export default HeaderBar;