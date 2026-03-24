import { useState } from "react";
import AuthPage from "./pages/AuthPage";
import Layout from "./components/Layout";
import DataHub from "./pages/DataHub";
import Dashboard from "./pages/Dashboard";
import AICopilot from "./pages/AICopilot";

export default function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("sapsight_user") || "null")
  );
  const [activePage, setActivePage] = useState("datahub");
  const [uploadedData, setUploadedData] = useState(null);

  const handleAuth = (data) => {
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem("sapsight_token");
    localStorage.removeItem("sapsight_user");
    setUser(null);
    setUploadedData(null);
  };

  if (!user) return <AuthPage onAuthSuccess={handleAuth} />;

  return (
    <Layout
      user={user}
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={handleLogout}
    >
      {activePage === "datahub" && (
        <DataHub onDataUploaded={setUploadedData} uploadedData={uploadedData} />
      )}
      {activePage === "dashboard" && (
        <Dashboard uploadedData={uploadedData} />
      )}
      {activePage === "copilot" && (
        <AICopilot uploadedData={uploadedData} />
      )}
    </Layout>
  );
}