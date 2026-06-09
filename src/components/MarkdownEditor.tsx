"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-3 last:mb-0">{children}</p>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong style={{ color: "#c0386b" }}>{children}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em style={{ color: "#a0405a" }}>{children}</em>,
  h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-xl font-bold mb-2" style={{ color: "#c0386b" }}>{children}</h1>,
  h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-lg font-bold mb-2" style={{ color: "#c0386b" }}>{children}</h2>,
  h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-base font-bold mb-1" style={{ color: "#c0386b" }}>{children}</h3>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-none pl-2 mb-3 space-y-1">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li className="before:content-['♥'] before:mr-2 before:text-pink-400">{children}</li>,
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-4 pl-4 italic my-3" style={{ borderColor: "#ffb3c6", color: "#a0405a" }}>
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-4 border-pink-200" />,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} className="underline" style={{ color: "#ff6b9d" }}>{children}</a>
  ),
};

type ToolbarAction = {
  label: string;
  title: string;
  action: (ta: HTMLTextAreaElement, value: string, onChange: (v: string) => void) => void;
};

const TOOLBAR: ToolbarAction[] = [
  {
    label: "B",
    title: "In đậm (**text**)",
    action: (ta, value, onChange) => wrapSelection(ta, value, onChange, "**", "**"),
  },
  {
    label: "I",
    title: "In nghiêng (*text*)",
    action: (ta, value, onChange) => wrapSelection(ta, value, onChange, "*", "*"),
  },
  {
    label: ">",
    title: "Trích dẫn",
    action: (ta, value, onChange) => prependLine(ta, value, onChange, "> "),
  },
  {
    label: "—",
    title: "Kẻ ngang (---)",
    action: (ta, value, onChange) => insertText(ta, value, onChange, "\n---\n"),
  },
  {
    label: "♥",
    title: "Danh sách (- item)",
    action: (ta, value, onChange) => prependLine(ta, value, onChange, "- "),
  },
];

function wrapSelection(
  ta: HTMLTextAreaElement,
  value: string,
  onChange: (v: string) => void,
  before: string,
  after: string,
) {
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const sel = value.slice(start, end) || "text";
  const newVal = value.slice(0, start) + before + sel + after + value.slice(end);
  onChange(newVal);
  requestAnimationFrame(() => {
    ta.focus();
    ta.setSelectionRange(start + before.length, start + before.length + sel.length);
  });
}

function prependLine(
  ta: HTMLTextAreaElement,
  value: string,
  onChange: (v: string) => void,
  prefix: string,
) {
  const start = ta.selectionStart;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const newVal = value.slice(0, lineStart) + prefix + value.slice(lineStart);
  onChange(newVal);
  requestAnimationFrame(() => {
    ta.focus();
    ta.setSelectionRange(start + prefix.length, start + prefix.length);
  });
}

function insertText(
  ta: HTMLTextAreaElement,
  value: string,
  onChange: (v: string) => void,
  text: string,
) {
  const pos = ta.selectionStart;
  const newVal = value.slice(0, pos) + text + value.slice(pos);
  onChange(newVal);
  requestAnimationFrame(() => {
    ta.focus();
    ta.setSelectionRange(pos + text.length, pos + text.length);
  });
}

export default function MarkdownEditor({ label, value, onChange }: Props) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const tabBtn = (active: boolean) => ({
    padding: "2px 12px",
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: active ? "rgba(255,105,135,0.18)" : "transparent",
    color: active ? "#c0386b" : "#b07090",
    transition: "background 0.15s",
  });

  const toolBtn = {
    padding: "2px 8px",
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    border: "1px solid rgba(255,105,135,0.25)",
    background: "rgba(255,255,255,0.7)",
    color: "#9d5672",
    lineHeight: "18px",
  };

  return (
    <div>
      {/* Label + tab switcher */}
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold" style={{ color: "#9d5672" }}>{label}</label>
        <div className="flex gap-1" style={{ background: "rgba(255,105,135,0.08)", borderRadius: 8, padding: "2px 3px" }}>
          <button type="button" style={tabBtn(tab === "edit")} onClick={() => setTab("edit")}>✏️ Soạn</button>
          <button type="button" style={tabBtn(tab === "preview")} onClick={() => setTab("preview")}>👁 Xem trước</button>
        </div>
      </div>

      {/* Toolbar — only in edit mode */}
      {tab === "edit" && (
        <div className="flex gap-1 mb-1 flex-wrap">
          {TOOLBAR.map((t) => (
            <button
              key={t.label}
              type="button"
              title={t.title}
              style={toolBtn}
              onMouseDown={(e) => {
                e.preventDefault();
                if (taRef.current) t.action(taRef.current, value, onChange);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      {tab === "edit" ? (
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 rounded-lg outline-none text-sm font-mono resize-y"
          style={{
            background: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,105,135,0.3)",
            color: "#7a3048",
            minHeight: 120,
          }}
        />
      ) : (
        <div
          className="w-full px-3 py-2 rounded-lg text-sm prose prose-sm max-w-none"
          style={{
            background: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(255,105,135,0.2)",
            color: "#7a3048",
            fontFamily: "Georgia, serif",
            minHeight: 120,
          }}
        >
          {value.trim() ? (
            <ReactMarkdown components={markdownComponents}>{value}</ReactMarkdown>
          ) : (
            <span style={{ color: "#c0a0b0", fontStyle: "italic" }}>Chưa có nội dung...</span>
          )}
        </div>
      )}
    </div>
  );
}
