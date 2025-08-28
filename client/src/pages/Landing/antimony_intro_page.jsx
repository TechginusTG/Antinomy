import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const logoUrl = new URL("../../assets/img/logo.png", import.meta.url).href;

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (hasVisited) {
      if (hasVisited != "true") {
        console.error("로컬스토리지 익스피리언스 레퀴엠엠엠엠");
        console.error(
          `분명 네가 로컬 스토리지값을 ${hasVisited}로 고친것은 틀림없는 진실이다.\n그러나 초기페이지로 돌아간다는 진실에는 절대로 도달할 수 없다.\n 넌 이제 /app으로 밖에 갈수 없어.\n 이것이 Localstorage.Experience.Requiem 다`
        );
      }
      navigate("/app", { replace: true });
    }
  }, [navigate]);

  const handleStartClick = () => {
    navigate("/app");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)",
        color: "#222",
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <img
          src={logoUrl}
          alt="ANTINOMY Logo"
          style={{
            width: "12.5rem",
            height: "12.5rem",
            borderRadius: "20%",
            boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
          }}
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        style={{
          fontSize: "3.2rem",
          fontWeight: 900,
          letterSpacing: "0.18em",
          marginBottom: "0.7rem",
          textAlign: "center",
          fontFamily: "Orbitron, Bebas Neue, Nanum Gothic Coding, sans-serif",
          color: "#2d3748",
          textShadow: "0 2px 12px rgba(99,102,241,0.18), 0 1px 0 #fff",
        }}
      >
        ANTINOMY
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        style={{
          marginTop: "0.5rem",
          fontSize: "1.15rem",
          color: "#4b5563",
          maxWidth: "420px",
          textAlign: "center",
          marginBottom: "1.5rem",
        }}
      >
        서로 다른 아이디어와 논리가 충돌하고 교차하는 공간.
        <br />
        다이어그램을 통해 복잡한 사고를 시각화하세요.
      </motion.p>

      {/* 시작 버튼 */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStartClick}
        style={{
          marginTop: "2.2rem",
          padding: "0.7em 2.2em",
          fontSize: "1.1rem",
          fontWeight: "bold",
          borderRadius: "999px",
          background: "linear-gradient(90deg, #6366f1 0%, #10b981 100%)",
          color: "#fff",
          border: "none",
          boxShadow: "0 2px 8px rgba(99,102,241,0.12)",
          cursor: "pointer",
          letterSpacing: "0.05em",
        }}
      >
        시작하기
      </motion.button>
    </div>
  );
}
