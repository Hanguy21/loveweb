"use client";

import { useEffect, useRef } from "react";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

// Migrate old plain-text / markdown content to basic HTML on first load
function migrateToHtml(text: string): string {
  if (!text.trim()) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return text; // already HTML
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .split(/\n\n+/)
    .map((para) => `<p>${para.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

type Cmd = { label: string; title: string; exec: () => void };

export default function MarkdownEditor({ label, value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  // Track last rendered value to avoid cursor-reset loop
  const lastHtml = useRef<string>("");

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = migrateToHtml(value);
    if (el.innerHTML !== html && html !== lastHtml.current) {
      el.innerHTML = html;
      lastHtml.current = html;
    }
  }, [value]);

  function handleInput() {
    const html = editorRef.current?.innerHTML ?? "";
    lastHtml.current = html;
    onChange(html);
  }

  function exec(cmd: string, arg?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
  }

  const toolBtn = (label: string, title: string, onClick: () => void) => (
    <button
      key={label}
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="px-2 py-0.5 rounded text-xs font-bold"
      style={{
        border: "1px solid rgba(255,105,135,0.25)",
        background: "rgba(255,255,255,0.7)",
        color: "#9d5672",
        cursor: "pointer",
        lineHeight: "18px",
      }}
    >
      {label}
    </button>
  );

  const TOOLS: Cmd[] = [
    { label: "B", title: "In đậm (Ctrl+B)", exec: () => exec("bold") },
    { label: "I", title: "In nghiêng (Ctrl+I)", exec: () => exec("italic") },
    { label: "U", title: "Gạch dưới (Ctrl+U)", exec: () => exec("underline") },
    { label: "♥ List", title: "Danh sách", exec: () => exec("insertUnorderedList") },
    { label: "—", title: "Kẻ ngang", exec: () => exec("insertHorizontalRule") },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold" style={{ color: "#9d5672" }}>{label}</label>
        <div className="flex gap-1 flex-wrap justify-end">
          {TOOLS.map((t) => toolBtn(t.label, t.title, t.exec))}
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Nhập nội dung thư..."
        onInput={handleInput}
        className="wysiwyg-editor w-full px-3 py-2 rounded-lg text-sm"
        style={{
          background: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(255,105,135,0.3)",
          color: "#7a3048",
          fontFamily: "Georgia, serif",
          minHeight: 140,
          lineHeight: 1.7,
        }}
      />

      <p className="text-xs mt-1" style={{ color: "#c0a0b0" }}>
        Ctrl+B đậm · Ctrl+I nghiêng · Enter xuống dòng
      </p>
    </div>
  );
}
