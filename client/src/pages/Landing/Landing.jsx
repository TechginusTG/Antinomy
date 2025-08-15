import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Landing.module.css"; // Assuming you have a CSS file for styling
import { Button } from "antd";
import img2 from "../../assets/img/2.png";
import img3 from "../../assets/img/3.png";
import img4 from "../../assets/img/4.png";
import photo1 from "../../assets/img/photo-1511721464821-5641710d5bf2.png";
import planBg1 from "../../assets/img/plan-bg1.png";

const images = [img2, img3, img4, photo1, planBg1];

const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
};

function LandingPage() {
    const [randomImage, setRandomImage] = useState("");

    useEffect(() => {
        setRandomImage(getRandomImage());

        const intervalId = setInterval(() => {
            setRandomImage(getRandomImage());
        }, 15000); // 15 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div
            className={styles.landingPage}
            style={{ backgroundImage: `url(${randomImage})` }}
        >
            <div className={styles.overlay}></div>
            <main className={styles["main-content"]}>
                <h1 className={styles["Title"]}>ANTINOMY</h1>
                <h2 className={`${styles.subtitle}`}>~의식의 흐름~</h2>
                <span>계획과 목표를 수립하고 실천하기</span>
                <Button
                    className={styles["main-button"]}
                    onClick={() => window.location.replace("/app")}
                >
                    시작하기
                </Button>
            </main>
        </div>
    );
}

export default LandingPage;
