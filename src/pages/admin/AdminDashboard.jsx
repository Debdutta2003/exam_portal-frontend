import { useState } from "react";
import { inviteUser } from "../../api/adminUserApi";
import AdminSidebar from "../../components/admin/AdminSidebar";
import CreateExamWizard from "../../components/admin/CreateExamWizard";
import InviteAdmin from "../../components/admin/InviteAdmin";
import AdminMonitoringDashboard from "../../components/admin/AdminMonitoringDashboard";
import "../../styles/AdminDashboard.css";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedExamId, setSelectedExamId] = useState(null);

  const handleMonitorExam = (examId) => {
    setSelectedExamId(examId);
    setActiveTab("monitorExam");
  };

  // Fixed: Go back to all exams, not create exam
  const handleBackFromMonitoring = () => {
    setSelectedExamId(null);
    setActiveTab("allExams");
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar setActiveTab={setActiveTab} />

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
            onBack={() => setActiveTab("exams")} // Go back to create exam
          />
        )}

        {activeTab === "monitorExam" && selectedExamId && (
          <AdminMonitoringDashboard 
            examId={selectedExamId}
            onMonitorExam={handleMonitorExam}
            onBack={handleBackFromMonitoring} // Go back to all exams
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
  );
}

export default AdminDashboard;