import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LoadingPage() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!showIntro) return null;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-black">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="mb-6"
      >
        <Image
          src="/logo.png" // 로고 파일을 public 폴더에 넣고 이름 맞춰주세요
          alt="ANTINOMY Logo"
          width={150}
          height={150}
        />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-4xl font-bold tracking-widest"
      >
        ANTINOMY
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-4 text-lg text-gray-600 max-w-lg text-center"
      >
        서로 다른 아이디어와 논리가 충돌하고 교차하는 공간. <br />
        다이어그램을 통해 복잡한 사고를 시각화하세요.
      </motion.p>

      {/* Loading animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1, repeat: Infinity, repeatType: "reverse" }}
        className="mt-10 text-gray-500"
      >
        Loading...
      </motion.div>
    </div>
  );
}
