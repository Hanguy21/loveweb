"use client";

import { motion } from "framer-motion";

interface Props {
  found: number;
  total: number;
}

export default function ProgressBar({ found, total }: Props) {
  const pct = (found / total) * 100;
  const hearts = Array.from({ length: total }, (_, i) => i < found);

  return (
    <motion.div
      className="fixed top-4 left-1/2 z-30 flex flex-col items-center gap-2"
      style={{ transform: "translateX(-50%)" }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className="flex gap-2 px-4 py-2 rounded-full shadow-md"
        style={{
          background: "rgba(255,255,255,0.4)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        {hearts.map((isFound, i) => (
          <motion.span
            key={i}
            className="text-lg"
            initial={false}
            animate={{ scale: isFound ? [1.5, 1] : 1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {isFound ? "❤️" : "🤍"}
          </motion.span>
        ))}
      </div>
      {found === 0 && (
        <motion.p
          className="text-sm font-medium px-3 py-1 rounded-full"
          style={{
            color: "#c0386b",
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(8px)",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨ Tìm 5 bức thư bí ẩn nào...
        </motion.p>
      )}
      {found > 0 && found < total && (
        <p
          className="text-sm font-medium"
          style={{ color: "#c0386b", textShadow: "0 1px 4px rgba(255,255,255,0.8)" }}
        >
          Đã tìm được {found}/{total} 💌
        </p>
      )}
    </motion.div>
  );
}
