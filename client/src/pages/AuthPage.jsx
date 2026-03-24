import { useState } from "react";
import { loginUser, registerUser } from "../api";

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let data;
      if (mode === "login") {
        data = await loginUser(form.email, form.password);
      } else {
        data = await registerUser(form.name, form.email, form.password);
      }
      localStorage.setItem("sapsight_token", data.token);
      localStorage.setItem("sapsight_user", JSON.stringify(data.user));
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => { setMode(m); setError(""); };

  return (
    <div style={s.root}>
      {/* Left Panel */}
      <div style={s.left}>
        <div style={s.brand}>
          <LogoSVG />
          <span style={s.brandName}>SAPSight</span>
        </div>
        <div style={s.heroBlock}>
          <h1 style={s.hero1}>Enterprise Analytics.</h1>
          <h1 style={s.hero2}>Without the Enterprise Price.</h1>
          <p style={s.heroSub}>
            Upload your data. Get instant AI-powered insights — modeled after
            SAP Analytics Cloud, built for everyone.
          </p>
        </div>
        <div style={s.pillsRow}>
          {["BTP Data Hub", "SAC Dashboards", "Joule AI Copilot"].map((p) => (
            <span key={p} style={s.pill}>{p}</span>
          ))}
        </div>
        <div style={s.quoteCard}>
          <p style={s.quoteText}>
            "Exactly what SAP Joule promises — but it actually works on my CSV files."
          </p>
          <p style={s.quoteAuthor}>— Business Analyst, Fortune 500</p>
        </div>
      </div>

      {/* Right Panel */}
      <div style={s.right}>
        <div style={s.card}>
          <div style={s.tabs}>
            <button
              style={mode === "login" ? s.tabActive : s.tab}
              onClick={() => switchMode("login")}
            >Sign In</button>
            <button
              style={mode === "register" ? s.tabActive : s.tab}
              onClick={() => switchMode("register")}
            >Register</button>
          </div>

          <h2 style={s.cardTitle}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p style={s.cardSub}>
            {mode === "login"
              ? "Sign in to access your dashboards and AI copilot."
              : "Start analysing your data in minutes."}
          </p>

          <form onSubmit={handleSubmit} style={s.form}>
            {mode === "register" && (
              <div style={s.field}>
                <label style={s.label}>Full Name</label>
                <input
                  style={s.input}
                  type="text"
                  name="name"
                  placeholder="Prathmesh Sakore"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input
                style={s.input}
                type="email"
                name="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>Password</label>
              <input
                style={s.input}
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div style={s.errorBox}>{error}</div>}

            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          <p style={s.switchText}>
            {mode === "login" ? "Don't have an account? " : "Already a member? "}
            <button
              style={s.switchLink}
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Register" : "Sign In"}
            </button>
          </p>
        </div>
        <p style={s.footer}>© 2026 SAPSight · Powered by React + MongoDB</p>
      </div>
    </div>
  );
}

function LogoSVG() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#0070F3" />
      <rect x="7" y="18" width="4" height="7" rx="1" fill="white" opacity="0.6" />
      <rect x="14" y="12" width="4" height="13" rx="1" fill="white" opacity="0.85" />
      <rect x="21" y="7" width="4" height="18" rx="1" fill="white" />
    </svg>
  );
}

const s = {
  root: { display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" },
  left: {
    flex: 1, background: "#0A0A14", display: "flex", flexDirection: "column",
    justifyContent: "center", padding: "60px 64px", gap: "36px",
  },
  brand: { display: "flex", alignItems: "center", gap: "12px" },
  brandName: { fontSize: "20px", fontWeight: "700", color: "#FFF", letterSpacing: "-0.5px" },
  heroBlock: { display: "flex", flexDirection: "column", gap: "8px" },
  hero1: { fontSize: "40px", fontWeight: "700", color: "#FFF", letterSpacing: "-1.5px", lineHeight: 1.1 },
  hero2: { fontSize: "40px", fontWeight: "700", color: "#0070F3", letterSpacing: "-1.5px", lineHeight: 1.1 },
  heroSub: { marginTop: "14px", fontSize: "15px", color: "#8A8A9A", lineHeight: "1.7", maxWidth: "380px" },
  pillsRow: { display: "flex", gap: "10px", flexWrap: "wrap" },
  pill: {
    padding: "6px 14px", borderRadius: "999px", border: "1px solid #2A2A3A",
    fontSize: "13px", color: "#C0C0D0", background: "#14141F",
  },
  quoteCard: {
    background: "#14141F", border: "1px solid #2A2A3A",
    borderRadius: "12px", padding: "20px 24px",
  },
  quoteText: { fontSize: "14px", color: "#D0D0E0", lineHeight: "1.6", fontStyle: "italic" },
  quoteAuthor: { marginTop: "10px", fontSize: "12px", color: "#5A5A7A" },

  right: {
    width: "480px", flexShrink: 0, background: "#F5F4F0",
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: "40px 32px", gap: "20px",
  },
  card: {
    width: "100%", maxWidth: "400px", background: "#FFF",
    borderRadius: "16px", border: "1px solid #E4E2DC",
    padding: "36px 36px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  tabs: {
    display: "flex", background: "#F5F4F0", borderRadius: "10px",
    padding: "4px", marginBottom: "28px",
  },
  tab: {
    flex: 1, padding: "8px", border: "none", background: "transparent",
    borderRadius: "7px", fontSize: "14px", color: "#888",
    cursor: "pointer", fontWeight: "500", fontFamily: "inherit",
  },
  tabActive: {
    flex: 1, padding: "8px", border: "none", background: "#FFF",
    borderRadius: "7px", fontSize: "14px", color: "#0A0A14",
    cursor: "pointer", fontWeight: "700", fontFamily: "inherit",
    boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
  },
  cardTitle: { fontSize: "22px", fontWeight: "700", color: "#0A0A14", letterSpacing: "-0.5px", marginBottom: "6px" },
  cardSub: { fontSize: "14px", color: "#888", lineHeight: "1.5", marginBottom: "28px" },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#444" },
  input: {
    padding: "10px 14px", border: "1.5px solid #E4E2DC", borderRadius: "8px",
    fontSize: "15px", color: "#0A0A14", background: "#FAFAF8",
    outline: "none", width: "100%",
  },
  errorBox: {
    background: "#FFF0F0", border: "1px solid #FFCCCC",
    borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#C0392B",
  },
  submitBtn: {
    marginTop: "4px", padding: "12px", background: "#0070F3", color: "#FFF",
    border: "none", borderRadius: "9px", fontSize: "15px", fontWeight: "600",
    cursor: "pointer", letterSpacing: "0.2px", width: "100%",
  },
  switchText: { marginTop: "20px", fontSize: "13px", color: "#888", textAlign: "center" },
  switchLink: {
    background: "none", border: "none", color: "#0070F3",
    fontWeight: "600", cursor: "pointer", fontFamily: "inherit", fontSize: "13px", padding: 0,
  },
  footer: { fontSize: "12px", color: "#AAA", textAlign: "center" },
};