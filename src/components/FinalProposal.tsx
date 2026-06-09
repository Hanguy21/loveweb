"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ProposalConfig } from "@/lib/messages";

interface Props {
  show: boolean;
  config: ProposalConfig;
}

export default function FinalProposal({ show, config }: Props) {
  const [answered, setAnswered] = useState<"yes" | "no" | null>(null);
  const [noCount, setNoCount] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (show) {
      setTimeout(() => launchConfetti(), 600);
    }
  }, [show]);

  function launchConfetti() {
    const colors = ["#ff6b9d", "#ff1493", "#ff69b4", "#ffb6c1", "#fff0f5"];
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors, shapes: ["circle"] });
    setTimeout(() => {
      confetti({ particleCount: 80, angle: 60, spread: 80, origin: { x: 0, y: 0.6 }, colors });
      confetti({ particleCount: 80, angle: 120, spread: 80, origin: { x: 1, y: 0.6 }, colors });
    }, 400);
  }

  function handleYes() {
    setAnswered("yes");
    for (let i = 0; i < 5; i++) {
      setTimeout(() => launchConfetti(), i * 400);
    }
  }

  function handleNo() {
    setNoCount((c) => c + 1);
    setNoPos({ x: Math.random() * 60 - 30, y: Math.random() * 60 - 30 });
  }

  const noButtonSize = Math.max(0.4, 1 - noCount * 0.15);
  const noMessages = ["Không", "Chắc không?", "Thật sự không?", "Nghĩ lại đi...", "Không nỡ đâu...", "Ừ thôi, có đó 😂"];
  const noLabel = noMessages[Math.min(noCount, noMessages.length - 1)];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ cursor: "default" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

          <AnimatePresence mode="wait">
            {answered === "yes" ? (
              <motion.div
                key="yes-response"
                className="relative z-10 text-center p-8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
              >
                <div className="text-8xl mb-6">💑</div>
                <h1
                  className="text-4xl md:text-6xl font-bold mb-4"
                  style={{ color: "white", textShadow: "0 0 30px rgba(255,105,135,0.8)", fontFamily: "Georgia, serif" }}
                >
                  {config.acceptedTitle}
                </h1>
                <p className="text-xl md:text-2xl" style={{ color: "#ffd6e7" }}>
                  {config.acceptedSub}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="proposal"
                className="relative z-10 text-center px-6"
                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 15, delay: 0.5 }}
              >
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  💍
                </motion.div>
                <h1
                  className="text-3xl md:text-5xl font-bold mb-3"
                  style={{ color: "white", textShadow: "0 0 20px rgba(255,105,135,0.9)", fontFamily: "Georgia, serif" }}
                >
                  {config.line1}
                </h1>
                <h1
                  className="text-3xl md:text-5xl font-bold mb-8"
                  style={{ color: "#ffd6e7", textShadow: "0 0 20px rgba(255,105,135,0.9)", fontFamily: "Georgia, serif" }}
                >
                  {config.line2}
                </h1>

                <div className="flex items-center justify-center gap-6 relative" style={{ height: 80 }}>
                  <motion.button
                    className="px-10 py-4 rounded-full text-white font-bold shadow-2xl"
                    style={{ background: "linear-gradient(135deg, #ff6b9d, #ff1493)", fontSize: "1.3rem" }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleYes}
                  >
                    {config.yesLabel}
                  </motion.button>

                  <motion.button
                    className="px-6 py-3 rounded-full font-semibold shadow-md"
                    style={{
                      background: "rgba(255,255,255,0.25)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.4)",
                      scale: noButtonSize,
                    }}
                    animate={{ x: noPos.x * (1 + noCount * 0.3), y: noPos.y * (1 + noCount * 0.3) }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    onMouseEnter={noCount < 5 ? handleNo : undefined}
                    onClick={noCount >= 5 ? handleYes : handleNo}
                  >
                    {noLabel}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
