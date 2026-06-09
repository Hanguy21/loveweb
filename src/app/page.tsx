"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getMessages, getProposal, Message, ProposalConfig } from "@/lib/messages";
import LetterModal from "@/components/LetterModal";
import ProgressBar from "@/components/ProgressBar";
import FinalProposal from "@/components/FinalProposal";

const HeartCanvas = dynamic(() => import("@/components/HeartCanvas"), { ssr: false });
const Clouds = dynamic(() => import("@/components/Clouds"), { ssr: false });
const FloatingBlock = dynamic(() => import("@/components/FloatingBlock"), { ssr: false });
const MusicPlayer = dynamic(() => import("@/components/MusicPlayer"), { ssr: false });

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [proposal, setProposal] = useState<ProposalConfig | null>(null);
  const [foundIds, setFoundIds] = useState<Set<number>>(new Set());
  const [openMessage, setOpenMessage] = useState<Message | null>(null);
  const [showProposal, setShowProposal] = useState(false);

  useEffect(() => {
    getMessages().then(setMessages);
    getProposal().then(setProposal);
  }, []);

  function handleFind(id: number) {
    if (foundIds.has(id)) return;
    const msg = messages.find((m) => m.id === id);
    if (!msg) return;
    setOpenMessage(msg);
    const next = new Set(foundIds);
    next.add(id);
    setFoundIds(next);
    if (next.size === messages.length) {
      setTimeout(() => {
        setOpenMessage(null);
        setTimeout(() => setShowProposal(true), 600);
      }, 3000);
    }
  }

  return (
    <main
      className="min-h-screen overflow-hidden relative"
      style={{ background: "linear-gradient(160deg, #a1c4fd 0%, #c2e9fb 40%, #fbc2eb 80%, #f9a8d4 100%)" }}
    >
      <Clouds />
      <HeartCanvas paused={openMessage !== null || showProposal} />
      <MusicPlayer />
      <ProgressBar found={foundIds.size} total={messages.length} />

      {messages.map((msg) => (
        <FloatingBlock
          key={msg.id}
          id={msg.id}
          emoji={msg.emoji}
          found={foundIds.has(msg.id)}
          onFind={handleFind}
        />
      ))}

      <LetterModal message={openMessage} onClose={() => setOpenMessage(null)} />
      {proposal && <FinalProposal show={showProposal} config={proposal} />}
    </main>
  );
}
