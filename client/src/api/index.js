const API_BASE = "http://localhost:5000";

const getToken = () => localStorage.getItem("sapsight_token");

const headers = (extra = {}) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
  ...extra,
});

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
};

export const registerUser = async (name, email, password) => {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
};

// ─── Data Hub ────────────────────────────────────────────────────────────────

export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/data/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data;
};

export const getDatasets = async () => {
  const res = await fetch(`${API_BASE}/api/data`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch datasets");
  return data;
};

export const getDatasetById = async (id) => {
  const res = await fetch(`${API_BASE}/api/data/${id}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch dataset");
  return data;
};

// ─── AI Copilot ──────────────────────────────────────────────────────────────

export const askCopilot = async (question, datasetId) => {
  const res = await fetch(`${API_BASE}/api/ai/ask`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ question, datasetId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "AI request failed");
  return data;
};