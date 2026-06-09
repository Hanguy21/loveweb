"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  id: number;
  emoji: string;
  found: boolean;
  onFind: (id: number) => void;
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function FloatingBlock({ id, emoji, found, onFind }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size] = useState(randomBetween(48, 90));
  const posRef = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);

  // Initialize position safely away from edges
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const newPos = {
      x: randomBetween(8, 80),
      y: randomBetween(10, 70),
    };
    posRef.current = newPos;
    setPos(newPos);
  }, []);

  // Wander to a new position every few seconds
  useEffect(() => {
    if (found) return;
    const wander = () => {
      const newPos = {
        x: randomBetween(5, 85),
        y: randomBetween(8, 75),
      };
      posRef.current = newPos;
      setPos(newPos);
    };
    const interval = setInterval(wander, randomBetween(4000, 8000));
    return () => clearInterval(interval);
  }, [found]);

  if (found) return null;

  return (
    <motion.div
      className="fixed z-20 cursor-pointer select-none"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      transition={{ duration: 3, ease: "easeInOut" }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onFind(id)}
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 3 + id * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex items-center justify-center rounded-2xl shadow-lg backdrop-blur-sm"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.45,
          background: "rgba(255,255,255,0.35)",
          border: "2px solid rgba(255,255,255,0.6)",
          opacity: 0.7,
        }}
      >
        {emoji}
      </motion.div>
    </motion.div>
  );
}
