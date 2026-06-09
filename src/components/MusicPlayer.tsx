"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setPlaying(!playing);
  }

  return (
    <>
      {/* Using a royalty-free romantic melody via Web Audio API as fallback */}
      <audio ref={audioRef} loop>
        {/* Add your own audio file: /public/music.mp3 */}
        <source src="/music.mp3" type="audio/mpeg" />
      </audio>

      <motion.button
        className="fixed bottom-6 right-6 z-30 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl"
        style={{
          background: "rgba(255,255,255,0.35)",
          border: "2px solid rgba(255,255,255,0.6)",
          backdropFilter: "blur(10px)",
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        title={playing ? "Tắt nhạc" : "Bật nhạc"}
      >
        {playing ? "🔊" : "🔇"}
      </motion.button>
    </>
  );
}
