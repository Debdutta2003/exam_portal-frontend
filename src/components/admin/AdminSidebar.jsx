import "../../styles/AdminSidebar.css";

function AdminSidebar({ setActiveTab }) {
  return (
    <div className="admin-sidebar">
      <h2>Admin Panel</h2>

      <button onClick={() => setActiveTab("overview")}>
        Dashboard Overview
      </button>

      <button onClick={() => setActiveTab("exams")}>
        Create Exam
      </button>

      <button onClick={() => setActiveTab("allExams")}>
        All Exams
      </button>

      <button onClick={() => setActiveTab("inviteAdmin")}>
        Invite Admin
      </button>

    </div>
  );
}

export default AdminSidebar;