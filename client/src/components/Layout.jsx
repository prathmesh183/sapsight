export default function Layout({ user, activePage, setActivePage, onLogout, children }) {
  const navItems = [
    { id: "datahub", label: "Data Hub", icon: <UploadIcon /> },
    { id: "dashboard", label: "Dashboard", icon: <ChartIcon /> },
    { id: "copilot", label: "AI Copilot", icon: <AIIcon /> },
  ];

  return (
    <div style={s.root}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.brand}>
          <LogoSVG />
          <span style={s.brandName}>SAPSight</span>
        </div>

        <nav style={s.nav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              style={activePage === item.id ? s.navItemActive : s.navItem}
              onClick={() => setActivePage(item.id)}
            >
              <span style={s.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={s.sidebarBottom}>
          <div style={s.userRow}>
            <div style={s.avatar}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div style={s.userInfo}>
              <span style={s.userName}>{user?.name || "User"}</span>
              <span style={s.userEmail}>{user?.email || ""}</span>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={onLogout}>
            <LogoutIcon /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={s.main}>
        {children}
      </main>
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────────────────── */
function LogoSVG() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#0070F3" />
      <rect x="7" y="18" width="4" height="7" rx="1" fill="white" opacity="0.6" />
      <rect x="14" y="12" width="4" height="13" rx="1" fill="white" opacity="0.85" />
      <rect x="21" y="7" width="4" height="18" rx="1" fill="white" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}
function AIIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
const s = {
  root: { display: "flex", minHeight: "100vh", background: "#F5F4F0" },
  sidebar: {
    width: "240px", flexShrink: 0, background: "#0A0A14",
    display: "flex", flexDirection: "column", padding: "24px 16px",
    position: "sticky", top: 0, height: "100vh",
  },
  brand: { display: "flex", alignItems: "center", gap: "10px", padding: "0 8px", marginBottom: "36px" },
  brandName: { fontSize: "18px", fontWeight: "700", color: "#FFF", letterSpacing: "-0.5px" },
  nav: { display: "flex", flexDirection: "column", gap: "4px", flex: 1 },
  navItem: {
    display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
    borderRadius: "8px", border: "none", background: "transparent",
    color: "#8A8A9A", fontSize: "14px", fontWeight: "500", cursor: "pointer",
    fontFamily: "inherit", textAlign: "left", transition: "all 0.15s",
  },
  navItemActive: {
    display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
    borderRadius: "8px", border: "none", background: "#1A1A2E",
    color: "#FFFFFF", fontSize: "14px", fontWeight: "600", cursor: "pointer",
    fontFamily: "inherit", textAlign: "left",
    boxShadow: "inset 3px 0 0 #0070F3",
  },
  navIcon: { display: "flex", alignItems: "center" },
  sidebarBottom: { borderTop: "1px solid #1E1E2E", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" },
  userRow: { display: "flex", alignItems: "center", gap: "10px", padding: "0 4px" },
  avatar: {
    width: "34px", height: "34px", borderRadius: "50%", background: "#0070F3",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "14px", fontWeight: "700", color: "#FFF", flexShrink: 0,
  },
  userInfo: { display: "flex", flexDirection: "column", minWidth: 0 },
  userName: { fontSize: "13px", fontWeight: "600", color: "#FFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userEmail: { fontSize: "11px", color: "#5A5A7A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  logoutBtn: {
    display: "flex", alignItems: "center", padding: "8px 12px",
    border: "1px solid #2A2A3A", borderRadius: "7px", background: "transparent",
    color: "#8A8A9A", fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.15s",
  },
  main: { flex: 1, minWidth: 0, overflowY: "auto", padding: "32px" },
};