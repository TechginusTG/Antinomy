import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (hasVisited) {
      if (hasVisited != "true") {
        console.error("로컬스토리지 익스피리언스 레퀴엠엠엠엠");
        console.error(`분명 네가 로컬 스토리지값을 ${hasVisited}로 고친것은 틀림없는 진실이다.\n그러나 초기페이지로 돌아간다는 진실에는 절대로 도달할 수 없다.\n 넌 이제 /app으로 밖에 갈수 없어.\n 이것이 Localstorage.Experience.Requiem 다`);
      }
      navigate("/app", { replace: true });
      return;
    }

    setRandomImage(getRandomImage());

    const intervalId = setInterval(() => {
      setRandomImage(getRandomImage());
    }, 15000); // 15 seconds

    return () => clearInterval(intervalId);
  }, [navigate]);

  const handleStart = () => {
    localStorage.setItem("hasVisited", true);
    navigate("/app");
  };

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
        <Button className={styles["main-button"]} onClick={handleStart}>
          시작하기
        </Button>
      </main>
    </div>
  );
}

export default LandingPage;
