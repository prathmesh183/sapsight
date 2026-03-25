import { useState, useRef, useEffect } from "react";
import { askCopilot } from "../api";

const SUGGESTED = [
  "Which product had the highest sales?",
  "What is the total revenue?",
  "Show me the top 3 categories by value.",
  "What are the average expenses?",
  "Which region performed best?",
];

export default function AICopilot({ uploadedData }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm SAPSight Copilot — your AI analyst, inspired by SAP Joule.\n\nUpload a CSV in the Data Hub, then ask me anything about your data. I'll answer with real numbers from your dataset.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const q = text || input.trim();
    if (!q) return;
    if (!uploadedData) {
      setMessages((m) => [
        ...m,
        { role: "user", text: q },
        { role: "assistant", text: "Please upload a CSV file in the Data Hub first — I need data to analyse!" },
      ]);
      setInput("");
      return;
    }

    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);

    try {
      const res = await askCopilot(q, uploadedData._id || uploadedData.id);
setMessages((m) => [...m, { role: "assistant", text: res.reply || res.answer || res.message || "Here's what I found." }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `Error: ${err.message}. Make sure the backend AI endpoint is running.` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.jouleIcon}>
            <JouleIcon />
          </div>
          <div>
            <h1 style={s.title}>AI Copilot</h1>
            <p style={s.subtitle}>Powered by your data · Inspired by SAP Joule</p>
          </div>
        </div>
        {uploadedData && (
          <div style={s.dataChip}>
            <div style={s.dataChipDot} />
            {uploadedData.filename || "Dataset loaded"} · {(uploadedData.rows?.length || 0).toLocaleString()} rows
          </div>
        )}
      </div>

      <div style={s.body}>
        {/* Chat window */}
        <div style={s.chatPane}>
          <div style={s.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={msg.role === "user" ? s.userBubbleWrap : s.aiBubbleWrap}>
                {msg.role === "assistant" && (
                  <div style={s.aiAvatar}><JouleIcon small /></div>
                )}
                <div style={msg.role === "user" ? s.userBubble : s.aiBubble}>
                  {msg.text.split("\n").map((line, j) => (
                    <span key={j}>{line}{j < msg.text.split("\n").length - 1 && <br />}</span>
                  ))}
                </div>
                {msg.role === "user" && (
                  <div style={s.userAvatar}>U</div>
                )}
              </div>
            ))}
            {loading && (
              <div style={s.aiBubbleWrap}>
                <div style={s.aiAvatar}><JouleIcon small /></div>
                <div style={s.aiBubble}>
                  <div style={s.typingDots}>
                    <span style={{ ...s.dot, animationDelay: "0ms" }} />
                    <span style={{ ...s.dot, animationDelay: "150ms" }} />
                    <span style={{ ...s.dot, animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={s.inputRow}>
            <textarea
              style={s.textarea}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about your data..."
              rows={1}
              disabled={loading}
            />
            <button
              style={{ ...s.sendBtn, opacity: (!input.trim() || loading) ? 0.45 : 1 }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <SendIcon />
            </button>
          </div>
        </div>

        {/* Suggestions sidebar */}
        <div style={s.sidebar}>
          <p style={s.sidebarTitle}>Suggested questions</p>
          <div style={s.suggestions}>
            {SUGGESTED.map((q) => (
              <button key={q} style={s.suggestion} onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>

          {uploadedData && (
            <div style={s.dataInfo}>
              <p style={s.dataInfoTitle}>Loaded Dataset</p>
              <div style={s.dataInfoRow}>
                <span style={s.dataInfoLabel}>File</span>
                <span style={s.dataInfoVal}>{uploadedData.filename || "dataset.csv"}</span>
              </div>
              <div style={s.dataInfoRow}>
                <span style={s.dataInfoLabel}>Rows</span>
                <span style={s.dataInfoVal}>{(uploadedData.rows?.length || 0).toLocaleString()}</span>
              </div>
              <div style={s.dataInfoRow}>
                <span style={s.dataInfoLabel}>Columns</span>
                <span style={s.dataInfoVal}>{(uploadedData.columns?.length || Object.keys(uploadedData.rows?.[0] || {}).length)}</span>
              </div>
              <div style={s.colList}>
                {(uploadedData.columns || Object.keys(uploadedData.rows?.[0] || {})).map((c) => (
                  <span key={c} style={s.colChip}>{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────────────────── */
function JouleIcon({ small }) {
  const size = small ? 16 : 22;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#0070F3" />
      <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
const s = {
  root: { display: "flex", flexDirection: "column", gap: "20px", height: "calc(100vh - 64px)", maxWidth: "1200px" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" },
  headerLeft: { display: "flex", alignItems: "center", gap: "14px" },
  jouleIcon: {
    width: "44px", height: "44px", borderRadius: "12px", background: "#EFF6FF",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: "26px", fontWeight: "700", color: "#0A0A14", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "14px", color: "#888", marginTop: "2px" },
  dataChip: {
    display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px",
    background: "#F0FFF8", border: "1px solid #B3EDD8", borderRadius: "999px",
    fontSize: "13px", color: "#00A86B", fontWeight: "500",
  },
  dataChipDot: { width: "7px", height: "7px", borderRadius: "50%", background: "#00A86B" },

  body: { display: "flex", gap: "20px", flex: 1, minHeight: 0 },

  chatPane: {
    flex: 1, background: "#FFF", borderRadius: "14px", border: "1px solid #E4E2DC",
    display: "flex", flexDirection: "column", overflow: "hidden",
  },
  messages: { flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" },

  aiBubbleWrap: { display: "flex", alignItems: "flex-start", gap: "10px" },
  userBubbleWrap: { display: "flex", alignItems: "flex-start", gap: "10px", justifyContent: "flex-end" },

  aiAvatar: {
    width: "28px", height: "28px", borderRadius: "50%", background: "#EFF6FF",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px",
  },
  userAvatar: {
    width: "28px", height: "28px", borderRadius: "50%", background: "#0070F3",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    fontSize: "12px", fontWeight: "700", color: "#FFF", marginTop: "2px",
  },

  aiBubble: {
    background: "#F8F7F4", borderRadius: "12px 12px 12px 2px",
    padding: "12px 16px", fontSize: "14px", color: "#1A1A2E",
    lineHeight: "1.6", maxWidth: "75%",
  },
  userBubble: {
    background: "#0070F3", borderRadius: "12px 12px 2px 12px",
    padding: "12px 16px", fontSize: "14px", color: "#FFF",
    lineHeight: "1.6", maxWidth: "75%",
  },

  typingDots: { display: "flex", gap: "4px", alignItems: "center", height: "18px" },
  dot: {
    width: "7px", height: "7px", borderRadius: "50%", background: "#C0BEB8",
    animation: "bounce 1s ease infinite",
    display: "inline-block",
  },

  inputRow: {
    display: "flex", gap: "10px", padding: "14px 16px",
    borderTop: "1px solid #F0EEE8", alignItems: "flex-end",
  },
  textarea: {
    flex: 1, padding: "10px 14px", border: "1.5px solid #E4E2DC",
    borderRadius: "10px", fontSize: "14px", color: "#0A0A14",
    background: "#FAFAF8", outline: "none", resize: "none",
    fontFamily: "inherit", lineHeight: "1.5",
  },
  sendBtn: {
    width: "40px", height: "40px", borderRadius: "10px", background: "#0070F3",
    border: "none", color: "#FFF", display: "flex", alignItems: "center",
    justifyContent: "center", cursor: "pointer", flexShrink: 0,
    transition: "opacity 0.15s",
  },

  sidebar: {
    width: "260px", flexShrink: 0, display: "flex",
    flexDirection: "column", gap: "16px",
  },
  sidebarTitle: { fontSize: "12px", fontWeight: "600", color: "#AAA", textTransform: "uppercase", letterSpacing: "0.5px" },
  suggestions: { display: "flex", flexDirection: "column", gap: "8px" },
  suggestion: {
    padding: "10px 14px", background: "#FFF", border: "1px solid #E4E2DC",
    borderRadius: "10px", fontSize: "13px", color: "#444", cursor: "pointer",
    fontFamily: "inherit", textAlign: "left", lineHeight: "1.4",
    transition: "all 0.15s",
  },

  dataInfo: {
    background: "#FFF", border: "1px solid #E4E2DC", borderRadius: "12px", padding: "16px",
    display: "flex", flexDirection: "column", gap: "10px",
  },
  dataInfoTitle: { fontSize: "12px", fontWeight: "600", color: "#AAA", textTransform: "uppercase", letterSpacing: "0.5px" },
  dataInfoRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  dataInfoLabel: { fontSize: "12px", color: "#AAA" },
  dataInfoVal: { fontSize: "13px", fontWeight: "600", color: "#333" },
  colList: { display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" },
  colChip: {
    padding: "3px 8px", background: "#F5F4F0", borderRadius: "5px",
    fontSize: "11px", color: "#555", fontFamily: "monospace",
  },
};