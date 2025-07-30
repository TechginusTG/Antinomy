import { Link } from "react-router-dom";
import styles from "./Landing.module.css"; // Assuming you have a CSS file for styling

function LandingPage() {
    return (
        <div className={styles.landingPage}>
            <main className={styles["main-content"]}>
                <h1 className={styles["Title"]}>ANTINOMY</h1>
                <h2 className={`${styles.subtitle}`}>~의식의 흐름~</h2>
                <span>계획과 목표를 수립하고 실천하기</span>
                <button
                    className={styles["main-button"]}
                    onClick={() => (window.location.href = "/app")}
                >
                    Go to App
                </button>
            </main>
        </div>
    );
}

export default LandingPage;
