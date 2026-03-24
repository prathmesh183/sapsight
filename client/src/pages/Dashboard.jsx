import { useEffect, useRef, useState } from "react";

export default function Dashboard({ uploadedData }) {
  const rows = uploadedData?.rows || [];

  if (!uploadedData || rows.length === 0) {
    return (
      <div style={s.root}>
        <div style={s.header}>
          <h1 style={s.title}>Analytics Dashboard</h1>
          <p style={s.subtitle}>Auto-generated charts from your data — mirrors SAP Analytics Cloud</p>
        </div>
        <div style={s.emptyState}>
          <ChartPlaceholderIcon />
          <p style={s.emptyTitle}>No data to visualise yet</p>
          <p style={s.emptyText}>Upload a CSV in the Data Hub first — charts and KPIs will appear here automatically.</p>
        </div>
      </div>
    );
  }

  const columns = uploadedData.columns || Object.keys(rows[0]);

  // Detect column types
  const numericCols = columns.filter((c) =>
    rows.slice(0, 20).every((r) => r[c] !== undefined && r[c] !== "" && !isNaN(Number(r[c])))
  );
  const dateCols = columns.filter((c) =>
    rows.slice(0, 10).some((r) => !isNaN(Date.parse(r[c])))
  );
  const categoryCols = columns.filter(
    (c) => !numericCols.includes(c) && !dateCols.includes(c)
  );

  const primaryNum = numericCols[0];
  const secondaryNum = numericCols[1];
  const primaryCat = categoryCols[0] || columns[0];
  const dateCol = dateCols[0];

  // KPIs
  const total = primaryNum
    ? rows.reduce((sum, r) => sum + Number(r[primaryNum] || 0), 0)
    : null;
  const avg = primaryNum && rows.length
    ? total / rows.length
    : null;
  const max = primaryNum
    ? Math.max(...rows.map((r) => Number(r[primaryNum] || 0)))
    : null;

  // Top category
  const catTotals = {};
  if (primaryCat && primaryNum) {
    rows.forEach((r) => {
      const k = r[primaryCat];
      catTotals[k] = (catTotals[k] || 0) + Number(r[primaryNum] || 0);
    });
  }
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

  // Bar chart data — top 8 categories
  const barData = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Line chart data — over date or index
  let lineData = [];
  if (dateCol && primaryNum) {
    lineData = rows
      .map((r) => ({ x: r[dateCol], y: Number(r[primaryNum] || 0) }))
      .sort((a, b) => new Date(a.x) - new Date(b.x))
      .slice(0, 30);
  } else if (primaryNum) {
    lineData = rows.slice(0, 30).map((r, i) => ({ x: `#${i + 1}`, y: Number(r[primaryNum] || 0) }));
  }

  // Pie chart — secondary numeric by category
  const pieData = barData.slice(0, 5);

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Analytics Dashboard</h1>
          <p style={s.subtitle}>Auto-generated from your data · {rows.length.toLocaleString()} rows</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={s.kpiGrid}>
        {primaryNum && (
          <>
            <KPICard label={`Total ${primaryNum}`} value={formatNum(total)} color="#0070F3" />
            <KPICard label={`Avg ${primaryNum}`} value={formatNum(avg)} color="#00A86B" />
            <KPICard label={`Max ${primaryNum}`} value={formatNum(max)} color="#FF6B35" />
          </>
        )}
        {topCat && (
          <KPICard label={`Top ${primaryCat}`} value={topCat[0]} sub={formatNum(topCat[1])} color="#8B5CF6" />
        )}
        {!primaryNum && (
          <KPICard label="Total Rows" value={rows.length.toLocaleString()} color="#0070F3" />
        )}
      </div>

      {/* Charts grid */}
      <div style={s.chartsGrid}>
        {barData.length > 0 && (
          <div style={s.chartCard}>
            <h3 style={s.chartTitle}>{primaryNum} by {primaryCat}</h3>
            <p style={s.chartSub}>Bar chart · Top 8</p>
            <BarChart data={barData} color="#0070F3" />
          </div>
        )}
        {lineData.length > 0 && (
          <div style={s.chartCard}>
            <h3 style={s.chartTitle}>{primaryNum} Trend</h3>
            <p style={s.chartSub}>Line chart · {dateCol ? "by date" : "by row order"}</p>
            <LineChart data={lineData} color="#00A86B" />
          </div>
        )}
        {pieData.length > 0 && (
          <div style={{ ...s.chartCard, ...s.chartCardWide }}>
            <h3 style={s.chartTitle}>Distribution by {primaryCat}</h3>
            <p style={s.chartSub}>Pie chart · Top 5 segments</p>
            <PieChart data={pieData} />
          </div>
        )}
        {secondaryNum && barData.length > 0 && (
          <div style={{ ...s.chartCard, ...s.chartCardWide }}>
            <h3 style={s.chartTitle}>{primaryNum} vs {secondaryNum}</h3>
            <p style={s.chartSub}>Comparison · by {primaryCat}</p>
            <GroupedBar
              data={barData.map((d) => ({
                label: d[0],
                a: d[1],
                b: rows.filter((r) => r[primaryCat] === d[0]).reduce((sum, r) => sum + Number(r[secondaryNum] || 0), 0),
              }))}
              labelA={primaryNum}
              labelB={secondaryNum}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── KPI Card ──────────────────────────────────────────────────────────── */
function KPICard({ label, value, sub, color }) {
  return (
    <div style={{ ...ks.card, borderTop: `3px solid ${color}` }}>
      <span style={ks.label}>{label}</span>
      <span style={{ ...ks.value, color }}>{value}</span>
      {sub && <span style={ks.sub}>{sub}</span>}
    </div>
  );
}

/* ── Bar Chart (pure SVG) ──────────────────────────────────────────────── */
function BarChart({ data, color }) {
  const W = 480, H = 200, PAD = { t: 10, r: 10, b: 40, l: 56 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...data.map((d) => d[1]));
  const barW = chartW / data.length - 6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.t + chartH * (1 - t);
        return (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#F0EEE8" strokeWidth="1" />
            <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#AAA">
              {formatShort(maxVal * t)}
            </text>
          </g>
        );
      })}
      {data.map(([label, val], i) => {
        const bH = (val / maxVal) * chartH;
        const x = PAD.l + i * (chartW / data.length) + 3;
        const y = PAD.t + chartH - bH;
        return (
          <g key={label}>
            <rect x={x} y={y} width={barW} height={bH} rx="3" fill={color} opacity="0.85" />
            <text
              x={x + barW / 2} y={H - PAD.b + 14}
              textAnchor="middle" fontSize="10" fill="#888"
            >
              {String(label).length > 8 ? String(label).slice(0, 7) + "…" : label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Line Chart (pure SVG) ─────────────────────────────────────────────── */
function LineChart({ data, color }) {
  const W = 480, H = 200, PAD = { t: 10, r: 10, b: 40, l: 56 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...data.map((d) => d.y));
  const minVal = Math.min(...data.map((d) => d.y));
  const range = maxVal - minVal || 1;

  const px = (i) => PAD.l + (i / (data.length - 1)) * chartW;
  const py = (v) => PAD.t + chartH - ((v - minVal) / range) * chartH;

  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(d.y)}`).join(" ");
  const areaD = pathD + ` L${px(data.length - 1)},${PAD.t + chartH} L${px(0)},${PAD.t + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t) => {
        const y = PAD.t + chartH * (1 - t);
        return (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#F0EEE8" strokeWidth="1" />
            <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#AAA">
              {formatShort(minVal + range * t)}
            </text>
          </g>
        );
      })}
      <path d={areaD} fill="url(#lineGrad)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d, i, arr) => {
        const origI = data.indexOf(d);
        return (
          <text key={i} x={px(origI)} y={H - PAD.b + 14} textAnchor="middle" fontSize="10" fill="#AAA">
            {String(d.x).length > 8 ? String(d.x).slice(5) : d.x}
          </text>
        );
      })}
    </svg>
  );
}

/* ── Pie Chart (pure SVG) ──────────────────────────────────────────────── */
const PIE_COLORS = ["#0070F3", "#00A86B", "#FF6B35", "#8B5CF6", "#F59E0B"];

function PieChart({ data }) {
  const total = data.reduce((s, d) => s + d[1], 0);
  let angle = -Math.PI / 2;
  const cx = 90, cy = 90, r = 75;

  const slices = data.map(([label, val], i) => {
    const sweep = (val / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    return { label, val, x1, y1, x2, y2, large, color: PIE_COLORS[i], pct: ((val / total) * 100).toFixed(1) };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
      <svg viewBox="0 0 180 180" style={{ width: "180px", height: "180px", flexShrink: 0 }}>
        {slices.map((sl, i) => (
          <path
            key={i}
            d={`M${cx},${cy} L${sl.x1},${sl.y1} A${r},${r} 0 ${sl.large} 1 ${sl.x2},${sl.y2} Z`}
            fill={sl.color}
            stroke="#FFF"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {slices.map((sl, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: sl.color, flexShrink: 0 }} />
            <span style={{ fontSize: "13px", color: "#555" }}>{sl.label}</span>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#0A0A14", marginLeft: "auto", paddingLeft: "16px" }}>{sl.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Grouped Bar ───────────────────────────────────────────────────────── */
function GroupedBar({ data, labelA, labelB }) {
  const W = 700, H = 200, PAD = { t: 10, r: 120, b: 40, l: 56 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...data.map((d) => Math.max(d.a, d.b)));
  const groupW = chartW / data.length;
  const barW = groupW / 2 - 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      {[0, 0.5, 1].map((t) => {
        const y = PAD.t + chartH * (1 - t);
        return (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#F0EEE8" strokeWidth="1" />
            <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#AAA">
              {formatShort(maxVal * t)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = PAD.l + i * groupW;
        const hA = (d.a / maxVal) * chartH;
        const hB = (d.b / maxVal) * chartH;
        return (
          <g key={i}>
            <rect x={x + 2} y={PAD.t + chartH - hA} width={barW} height={hA} rx="2" fill="#0070F3" opacity="0.85" />
            <rect x={x + barW + 4} y={PAD.t + chartH - hB} width={barW} height={hB} rx="2" fill="#00A86B" opacity="0.85" />
            <text x={x + groupW / 2} y={H - PAD.b + 14} textAnchor="middle" fontSize="10" fill="#888">
              {String(d.label).length > 8 ? String(d.label).slice(0, 7) + "…" : d.label}
            </text>
          </g>
        );
      })}
      <rect x={W - PAD.r + 10} y={PAD.t + 10} width="10" height="10" rx="2" fill="#0070F3" />
      <text x={W - PAD.r + 26} y={PAD.t + 19} fontSize="11" fill="#555">{labelA}</text>
      <rect x={W - PAD.r + 10} y={PAD.t + 28} width="10" height="10" rx="2" fill="#00A86B" />
      <text x={W - PAD.r + 26} y={PAD.t + 37} fontSize="11" fill="#555">{labelB}</text>
    </svg>
  );
}

function ChartPlaceholderIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#D0CEC8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function formatNum(n) {
  if (n === null || n === undefined) return "—";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return Number(n).toFixed(0);
}
function formatShort(n) {
  if (!n && n !== 0) return "";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return Number(n).toFixed(0);
}

const s = {
  root: { display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1200px" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontSize: "26px", fontWeight: "700", color: "#0A0A14", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "14px", color: "#888", marginTop: "4px" },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" },
  chartsGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" },
  chartCard: {
    background: "#FFF", borderRadius: "14px", border: "1px solid #E4E2DC",
    padding: "20px 24px", display: "flex", flexDirection: "column", gap: "4px",
  },
  chartCardWide: { gridColumn: "1 / -1" },
  chartTitle: { fontSize: "15px", fontWeight: "700", color: "#0A0A14" },
  chartSub: { fontSize: "12px", color: "#AAA", marginBottom: "12px" },
  emptyState: {
    background: "#FFF", borderRadius: "14px", border: "1px solid #E4E2DC",
    padding: "60px 40px", display: "flex", flexDirection: "column",
    alignItems: "center", gap: "12px",
  },
  emptyTitle: { fontSize: "16px", fontWeight: "600", color: "#555" },
  emptyText: { fontSize: "14px", color: "#AAA", textAlign: "center", maxWidth: "420px", lineHeight: "1.6" },
};

const ks = {
  card: {
    background: "#FFF", borderRadius: "12px", border: "1px solid #E4E2DC",
    padding: "16px 20px", display: "flex", flexDirection: "column", gap: "4px",
  },
  label: { fontSize: "12px", color: "#AAA", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" },
  value: { fontSize: "26px", fontWeight: "700", letterSpacing: "-0.5px" },
  sub: { fontSize: "12px", color: "#888" },
};