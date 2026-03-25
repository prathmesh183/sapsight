import { useState, useRef } from "react";
import { uploadCSV } from "../api";

export default function DataHub({ onDataUploaded, uploadedData }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are supported.");
      return;
    }
    setError("");
    setUploading(true);
    try {
    const data = await uploadCSV(file);
    onDataUploaded(data.dataset || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const onFileChange = (e) => handleFile(e.target.files[0]);

  const rows = uploadedData?.rows || [];
  const columns = uploadedData?.columns || (rows.length > 0 ? Object.keys(rows[0]) : []);
  const previewRows = rows.slice(0, 10);

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Data Hub</h1>
          <p style={s.subtitle}>Upload your CSV files — mirrors SAP BTP Integration Suite</p>
        </div>
        {uploadedData && (
          <div style={s.statsRow}>
            <Stat label="Rows" value={rows.length.toLocaleString()} />
            <Stat label="Columns" value={columns.length} />
            <Stat label="File" value={uploadedData.filename || "dataset.csv"} />
          </div>
        )}
      </div>

      {/* Upload Zone */}
      <div
        style={{ ...s.dropZone, ...(dragging ? s.dropZoneDrag : {}) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={onFileChange}
        />
        {uploading ? (
          <div style={s.uploadingState}>
            <div style={s.spinner} />
            <p style={s.dropText}>Uploading and parsing your data...</p>
          </div>
        ) : (
          <>
            <div style={s.uploadIcon}>
              <UploadIcon />
            </div>
            <p style={s.dropTitle}>
              {dragging ? "Drop it!" : "Drop your CSV here"}
            </p>
            <p style={s.dropText}>or click to browse · Supports any CSV with headers</p>
            <div style={s.uploadBtn}>Choose File</div>
          </>
        )}
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {/* Preview Table */}
      {uploadedData && rows.length > 0 && (
        <div style={s.tableSection}>
          <div style={s.tableTitleRow}>
            <h2 style={s.tableTitle}>Data Preview</h2>
            <span style={s.tableSubtitle}>Showing first {previewRows.length} of {rows.length} rows</span>
          </div>
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col} style={s.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                    {columns.map((col) => (
                      <td key={col} style={s.td}>{row[col] ?? "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={s.hint}>
            ✓ Data loaded. Head over to <strong>Dashboard</strong> to see your charts, or ask the <strong>AI Copilot</strong> questions.
          </div>
        </div>
      )}

      {!uploadedData && !uploading && (
        <div style={s.emptyState}>
          <p style={s.emptyTitle}>No data uploaded yet</p>
          <p style={s.emptyText}>Upload a CSV with columns like Date, Product, Revenue, Expenses, Region — the dashboard will auto-generate charts from whatever you upload.</p>
          <div style={s.sampleCols}>
            {["Date", "Product", "Revenue", "Expenses", "Region", "Sales_Rep"].map(c => (
              <span key={c} style={s.sampleCol}>{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={st.stat}>
      <span style={st.statValue}>{value}</span>
      <span style={st.statLabel}>{label}</span>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0070F3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

const s = {
  root: { display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1100px" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" },
  title: { fontSize: "26px", fontWeight: "700", color: "#0A0A14", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "14px", color: "#888", marginTop: "4px" },
  statsRow: { display: "flex", gap: "12px" },

  dropZone: {
    border: "2px dashed #D0CEC8", borderRadius: "14px", background: "#FFF",
    padding: "48px 32px", display: "flex", flexDirection: "column",
    alignItems: "center", gap: "12px", cursor: "pointer",
    transition: "all 0.2s",
  },
  dropZoneDrag: { border: "2px dashed #0070F3", background: "#F0F7FF" },
  uploadIcon: { marginBottom: "4px" },
  dropTitle: { fontSize: "18px", fontWeight: "600", color: "#0A0A14" },
  dropText: { fontSize: "14px", color: "#888" },
  uploadBtn: {
    marginTop: "8px", padding: "9px 24px", background: "#0070F3", color: "#FFF",
    borderRadius: "8px", fontSize: "14px", fontWeight: "600",
  },
  uploadingState: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
  spinner: {
    width: "32px", height: "32px", border: "3px solid #E0E0E0",
    borderTop: "3px solid #0070F3", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  errorBox: {
    background: "#FFF0F0", border: "1px solid #FFCCCC",
    borderRadius: "8px", padding: "12px 16px", fontSize: "14px", color: "#C0392B",
  },

  tableSection: { display: "flex", flexDirection: "column", gap: "14px" },
  tableTitleRow: { display: "flex", alignItems: "baseline", gap: "12px" },
  tableTitle: { fontSize: "18px", fontWeight: "700", color: "#0A0A14" },
  tableSubtitle: { fontSize: "13px", color: "#AAA" },
  tableWrap: { overflowX: "auto", borderRadius: "12px", border: "1px solid #E4E2DC" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px", background: "#FFF" },
  th: {
    padding: "10px 14px", textAlign: "left", fontWeight: "600", fontSize: "12px",
    color: "#666", background: "#F8F7F4", borderBottom: "1px solid #E4E2DC",
    whiteSpace: "nowrap",
  },
  td: { padding: "9px 14px", color: "#333", borderBottom: "1px solid #F0EEE8", whiteSpace: "nowrap" },
  trEven: { background: "#FFF" },
  trOdd: { background: "#FAFAF8" },

  hint: {
    fontSize: "13px", color: "#555", background: "#F0F7FF",
    border: "1px solid #C8DFF8", borderRadius: "8px", padding: "12px 16px",
  },

  emptyState: {
    background: "#FFF", borderRadius: "14px", border: "1px solid #E4E2DC",
    padding: "40px", display: "flex", flexDirection: "column", gap: "12px",
  },
  emptyTitle: { fontSize: "16px", fontWeight: "600", color: "#333" },
  emptyText: { fontSize: "14px", color: "#888", lineHeight: "1.6", maxWidth: "520px" },
  sampleCols: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" },
  sampleCol: {
    padding: "4px 12px", background: "#F5F4F0", borderRadius: "6px",
    fontSize: "12px", color: "#555", fontFamily: "monospace",
  },
};

const st = {
  stat: {
    background: "#FFF", border: "1px solid #E4E2DC", borderRadius: "10px",
    padding: "10px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
  },
  statValue: { fontSize: "18px", fontWeight: "700", color: "#0A0A14" },
  statLabel: { fontSize: "11px", color: "#AAA", textTransform: "uppercase", letterSpacing: "0.5px" },
};