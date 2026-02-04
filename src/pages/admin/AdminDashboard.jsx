import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { logout } from "../../api/authApi";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/admin/AdminSidebar";
import CreateExamWizard from "../../components/admin/CreateExamWizard";
import InviteAdmin from "../../components/admin/InviteAdmin";
import AdminMonitoringDashboard from "../../components/admin/AdminMonitoringDashboard";

import "../../styles/AdminDashboard.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedExamId, setSelectedExamId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");



  // 🔐 JWT expiry check
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        navigate("/");
      }
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/");
    }
  }, [navigate]);

  // 🚪 Logout
 const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/");
};


  const handleMonitorExam = (examId) => {
    setSelectedExamId(examId);
    setActiveTab("monitorExam");
  };

  const handleBackFromMonitoring = () => {
    setSelectedExamId(null);
    setActiveTab("allExams");
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar setActiveTab={setActiveTab} />

      <div className="admin-main">
        {/* 🔝 Top Bar */}
        <div className="admin-topbar">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* 📄 Content */}
        <div className="admin-content">
          {activeTab === "overview" && (
            <>
              <h1>Dashboard Overview</h1>
              <p>Welcome to the Admin Dashboard.</p>
            </>
          )}

          {activeTab === "exams" && (
            <>
              <h1>Create New Exam</h1>
              <CreateExamWizard />
            </>
          )}

          {activeTab === "allExams" && (
            <AdminMonitoringDashboard
              onMonitorExam={handleMonitorExam}
              onBack={() => setActiveTab("exams")}
            />
          )}

          {activeTab === "monitorExam" && selectedExamId && (
            <AdminMonitoringDashboard
              examId={selectedExamId}
              onBack={handleBackFromMonitoring}
            />
          )}

          {activeTab === "inviteAdmin" && (
            <>
              <h1>Invite Admin</h1>
              <InviteAdmin />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
