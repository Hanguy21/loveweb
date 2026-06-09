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
  const [nearCursor, setNearCursor] = useState(false);
  const posRef = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const newPos = { x: randomBetween(8, 80), y: randomBetween(10, 70) };
    posRef.current = newPos;
    setPos(newPos);
  }, []);

  useEffect(() => {
    if (found) return;
    const wander = () => {
      const newPos = { x: randomBetween(5, 85), y: randomBetween(8, 75) };
      posRef.current = newPos;
      setPos(newPos);
    };
    const interval = setInterval(wander, randomBetween(4000, 8000));
    return () => clearInterval(interval);
  }, [found]);

  // Phát hiện chuột lại gần → rung nhẹ
  useEffect(() => {
    if (found) return;
    const onMouseMove = (e: MouseEvent) => {
      const el = blockRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
      setNearCursor(dist < 120);
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [found]);

  if (found) return null;

  return (
    <motion.div
      ref={blockRef}
      className="fixed z-20 cursor-pointer select-none"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      transition={{ duration: 3, ease: "easeInOut" }}
      whileHover={{ scale: 1.25 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onFind(id)}
    >
      <motion.div
        animate={
          nearCursor
            ? { y: [0, -6, 4, -4, 0], rotate: [-5, 5, -5, 5, 0], scale: [1, 1.08, 1] }
            : { y: [0, -10, 0], rotate: [-3, 3, -3] }
        }
        transition={
          nearCursor
            ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 3 + id * 0.4, repeat: Infinity, ease: "easeInOut" }
        }
        className="flex items-center justify-center rounded-2xl shadow-lg backdrop-blur-sm"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.45,
          background: nearCursor
            ? "rgba(255,200,220,0.55)"
            : "rgba(255,255,255,0.35)",
          border: nearCursor
            ? "2px solid rgba(255,105,135,0.7)"
            : "2px solid rgba(255,255,255,0.6)",
          opacity: nearCursor ? 0.95 : 0.7,
          transition: "background 0.3s, border 0.3s, opacity 0.3s",
        }}
      >
        {emoji}
      </motion.div>
    </motion.div>
  );
}
