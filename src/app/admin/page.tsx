"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getMessages, saveMessages, Message,
  getProposal, saveProposal, ProposalConfig,
} from "@/lib/messages";
import { createClient } from "@/utils/supabase/client";

interface ResponseLog {
  id: string;
  answer: "yes" | "no";
  created_at: string;
}

const ADMIN_PASSWORD = "matkhau123";

const inputStyle = {
  background: "rgba(255,255,255,0.8)",
  border: "1px solid rgba(255,105,135,0.3)",
  color: "#7a3048",
};

function Field({ label, value, onChange, multiline }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold mb-1 block" style={{ color: "#9d5672" }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-lg outline-none text-sm resize-none"
          style={{ ...inputStyle, fontFamily: "Georgia, serif" }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg outline-none text-sm"
          style={inputStyle}
        />
      )}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [proposal, setProposal] = useState<ProposalConfig | null>(null);
  const [responses, setResponses] = useState<ResponseLog[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authed) return;
    getMessages().then(setMessages);
    getProposal().then(setProposal);
    fetchResponses();

    // Real-time: cập nhật log ngay khi có phản hồi mới
    const supabase = createClient();
    const channel = supabase
      .channel("responses-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "responses" }, (payload) => {
        setResponses((prev) => [payload.new as ResponseLog, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [authed]);

  async function fetchResponses() {
    const supabase = createClient();
    const { data } = await supabase
      .from("responses")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setResponses(data as ResponseLog[]);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false); }
    else { setPwError(true); setPw(""); }
  }

  function handleMsgChange(id: number, field: keyof Message, value: string) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
    setSaved(false);
  }

  function handleProposalChange(field: keyof ProposalConfig, value: string) {
    setProposal((prev) => prev ? { ...prev, [field]: value } : prev);
    setSaved(false);
  }

  async function handleSave() {
    await Promise.all([
      saveMessages(messages),
      proposal ? saveProposal(proposal) : Promise.resolve(),
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const cardStyle = {
    background: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(255,105,135,0.2)",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(160deg, #a1c4fd 0%, #c2e9fb 40%, #fbc2eb 80%, #f9a8d4 100%)" }}
    >
      <AnimatePresence mode="wait">
        {!authed ? (
          <motion.div key="login" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-sm">
            <div className="rounded-3xl p-8 shadow-2xl" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)" }}>
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🔐</div>
                <h1 className="text-2xl font-bold" style={{ color: "#c0386b" }}>Admin Panel</h1>
                <p className="text-sm mt-1" style={{ color: "#9d5672" }}>Chỉ dành cho người gửi thư 💌</p>
              </div>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input
                  type="password" value={pw} onChange={(e) => setPw(e.target.value)}
                  placeholder="Nhập mật khẩu..." autoFocus
                  className="w-full px-4 py-3 rounded-xl outline-none text-center"
                  style={{ background: "rgba(255,255,255,0.7)", border: pwError ? "2px solid #ff4444" : "2px solid rgba(255,105,135,0.3)", color: "#c0386b" }}
                />
                {pwError && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 text-center">Mật khẩu không đúng rồi! 🙈</motion.p>}
                <motion.button type="submit" className="w-full py-3 rounded-xl text-white font-bold shadow-md" style={{ background: "linear-gradient(135deg, #ff6b9d, #ff1493)" }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  Đăng nhập 💗
                </motion.button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl py-8">
            <div className="rounded-3xl p-8 shadow-2xl" style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.8)" }}>
              <div className="text-center mb-8">
                <div className="text-4xl mb-2">✍️</div>
                <h1 className="text-2xl font-bold" style={{ color: "#c0386b" }}>Chỉnh sửa nội dung</h1>
                <p className="text-sm mt-1" style={{ color: "#9d5672" }}>5 bức thư + màn hình cầu hôn</p>
              </div>

              {/* 5 Letters */}
              <div className="flex flex-col gap-6 mb-6">
                {messages.map((msg) => (
                  <div key={msg.id} className="rounded-2xl p-5" style={cardStyle}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{msg.emoji}</span>
                      <span className="text-sm font-bold uppercase tracking-wide" style={{ color: "#c0386b" }}>Bức thư #{msg.id}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Field label="Tiêu đề" value={msg.title} onChange={(v) => handleMsgChange(msg.id, "title", v)} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold mb-1 block" style={{ color: "#9d5672" }}>Icon</label>
                          <input value={msg.emoji} onChange={(e) => handleMsgChange(msg.id, "emoji", e.target.value)}
                            className="w-16 px-3 py-2 rounded-lg outline-none text-center text-lg"
                            style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,105,135,0.3)" }}
                          />
                        </div>
                      </div>
                      <Field label="Nội dung" value={msg.content} onChange={(v) => handleMsgChange(msg.id, "content", v)} multiline />
                    </div>
                  </div>
                ))}
              </div>

              {/* Proposal section */}
              {proposal && (
                <div className="rounded-2xl p-5" style={{ ...cardStyle, border: "1px solid rgba(255,105,135,0.4)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">💍</span>
                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: "#c0386b" }}>Màn hình cầu hôn</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Dòng chữ 1 (trắng)" value={proposal.line1} onChange={(v) => handleProposalChange("line1", v)} />
                      <Field label="Dòng chữ 2 (hồng)" value={proposal.line2} onChange={(v) => handleProposalChange("line2", v)} />
                    </div>
                    <Field label='Nút "Có"' value={proposal.yesLabel} onChange={(v) => handleProposalChange("yesLabel", v)} />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Tiêu đề khi đồng ý" value={proposal.acceptedTitle} onChange={(v) => handleProposalChange("acceptedTitle", v)} />
                      <Field label="Câu phụ khi đồng ý" value={proposal.acceptedSub} onChange={(v) => handleProposalChange("acceptedSub", v)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Response log */}
              <div className="mt-6 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,105,135,0.2)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📊</span>
                  <span className="text-sm font-bold uppercase tracking-wide" style={{ color: "#c0386b" }}>Phản hồi của người ấy</span>
                  {responses.length > 0 && (
                    <span className="ml-auto text-xs px-2 py-1 rounded-full font-semibold" style={{ background: "rgba(255,105,135,0.15)", color: "#c0386b" }}>
                      {responses.length} lần
                    </span>
                  )}
                </div>

                {responses.length === 0 ? (
                  <p className="text-sm text-center py-4" style={{ color: "#b07090" }}>
                    Chưa có phản hồi nào... 🕐
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                    {responses.map((r) => (
                      <div key={r.id} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: r.answer === "yes" ? "rgba(255,105,135,0.12)" : "rgba(180,180,180,0.12)" }}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{r.answer === "yes" ? "💗" : "🙈"}</span>
                          <span className="text-sm font-semibold" style={{ color: r.answer === "yes" ? "#c0386b" : "#888" }}>
                            {r.answer === "yes" ? "Đồng ý rồi!" : "Bấm Không"}
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: "#b07090" }}>
                          {new Date(r.created_at).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <a href="/" className="text-sm underline" style={{ color: "#9d5672" }}>← Xem trang chính</a>
                <div className="flex items-center gap-4">
                  <AnimatePresence>
                    {saved && (
                      <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-sm font-medium" style={{ color: "#22c55e" }}>
                        ✓ Đã lưu!
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <motion.button onClick={handleSave} className="px-8 py-3 rounded-xl text-white font-bold shadow-md" style={{ background: "linear-gradient(135deg, #ff6b9d, #ff1493)" }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    Lưu thay đổi 💾
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
