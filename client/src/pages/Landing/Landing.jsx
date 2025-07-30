import { Link } from 'react-router-dom';
import styles from "./Landing.module.css"; // Assuming you have a CSS file for styling

function LandingPage() {
  return (
    <div className={styles.landingPage}>
      <main>
        <p className={styles["Title"]}>This is the landing page.</p>
        <button className={styles["main-button"]} onClick={() => window.location.href = "/app"}>Go to App</button>
      </main>
    </div>
  );
}

export default LandingPage;