"use client";

import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Message } from "@/lib/messages";

interface Props {
  message: Message | null;
  onClose: () => void;
}

export default function LetterModal({ message, onClose }: Props) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ cursor: "default" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <motion.div
            className="relative z-10 max-w-md w-full"
            initial={{ scale: 0.5, rotate: -5, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotate: 5, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Envelope flap */}
            <div
              className="w-full rounded-t-2xl"
              style={{
                background: "linear-gradient(135deg, #ffd6e7, #ffb3c6)",
                height: 24,
              }}
            />
            {/* Letter body */}
            <div
              className="rounded-b-2xl p-8 shadow-2xl"
              style={{
                background: "linear-gradient(160deg, #fff9fb, #fff0f5)",
                border: "1px solid rgba(255,105,135,0.2)",
              }}
            >
              <div className="text-4xl text-center mb-4">{message.emoji}</div>
              <h2
                className="text-2xl font-bold text-center mb-4"
                style={{ color: "#c0386b" }}
              >
                {message.title}
              </h2>
              <div
                className="text-base leading-relaxed prose prose-sm max-w-none"
                style={{ color: "#7a3048", fontFamily: "Georgia, serif" }}
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong style={{ color: "#c0386b" }}>{children}</strong>,
                    em: ({ children }) => <em style={{ color: "#a0405a" }}>{children}</em>,
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2" style={{ color: "#c0386b" }}>{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-2" style={{ color: "#c0386b" }}>{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold mb-1" style={{ color: "#c0386b" }}>{children}</h3>,
                    ul: ({ children }) => <ul className="list-none pl-2 mb-3 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="before:content-['♥'] before:mr-2 before:text-pink-400">{children}</li>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 pl-4 italic my-3" style={{ borderColor: "#ffb3c6", color: "#a0405a" }}>
                        {children}
                      </blockquote>
                    ),
                    hr: () => <hr className="my-4 border-pink-200" />,
                    a: ({ href, children }) => <a href={href} className="underline" style={{ color: "#ff6b9d" }}>{children}</a>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              <div className="mt-6 flex justify-center">
                <motion.button
                  className="px-6 py-2 rounded-full text-white font-semibold shadow-md"
                  style={{ background: "linear-gradient(135deg, #ff6b9d, #ff1493)" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                >
                  Đóng lại 💌
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
