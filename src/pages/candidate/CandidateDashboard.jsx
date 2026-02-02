import { useState, useEffect } from "react";
import CandidateSidebar from "../../components/candidate/CandidateSidebar";
import CandidateExamCard from "../../components/candidate/CandidateExamCard";
import { getStudentExams } from "../../api/candidateApi";
import "../../styles/CandidateDashboard.css";

function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getStudentExams();
      
      // Ensure we have an array
      const examsData = Array.isArray(response.data) ? response.data : [];
      setExams(examsData);
      
    } catch (err) {
      console.error("Error fetching student exams:", err);
      setError("Failed to load exams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Updated: Filter exams based on your API status values
  const upcomingExams = exams.filter(exam => {
    const status = exam.status?.toUpperCase();
    // "INVITED" means the student has been invited but hasn't started
    // "PENDING" means started but not completed
    return status === "INVITED" || status === "PENDING" || status === "ONGOING";
  });

  const completedExams = exams.filter(exam => {
    const status = exam.status?.toUpperCase();
    return status === "COMPLETED" || status === "SUBMITTED";
  });

  const formatInviteRemaining = (inviteRemaining) => {
    if (!inviteRemaining || inviteRemaining === "EXPIRED") {
      return "Expired";
    }
    return inviteRemaining;
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";
    
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case "INVITED":
        return "Invited - Start Exam";
      case "PENDING":
        return "Pending - Resume";
      case "ONGOING":
        return "Ongoing - Continue";
      case "COMPLETED":
        return "Completed";
      case "SUBMITTED":
        return "Submitted";
      default:
        return status;
    }
  };

  // Get button text based on status
  const getButtonText = (status) => {
    const statusUpper = (status || "").toUpperCase();
    switch (statusUpper) {
      case "INVITED":
        return "Start Exam";
      case "PENDING":
        return "Resume Exam";
      case "ONGOING":
        return "Continue Exam";
      default:
        return "Start Exam";
    }
  };

  return (
    <div className="candidate-dashboard">
      <CandidateSidebar setActiveTab={setActiveTab} />

      <div className="candidate-content">
        <div className="dashboard-header">
          <h1>
            {activeTab === "upcoming"
              ? "Upcoming Exams"
              : "Completed Exams"}
          </h1>
          <button 
            className="btn-refresh"
            onClick={fetchExams}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchExams}>Try Again</button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading exams...</div>
        ) : (
          <div className="exam-list">
            {activeTab === "upcoming" ? (
              upcomingExams.length > 0 ? (
                upcomingExams.map((exam) => (
                  <CandidateExamCard 
                    key={exam.examId} 
                    exam={{
                      id: exam.examId,
                      title: exam.title,
                      duration: `${exam.duration} minutes`,
                      status: formatStatus(exam.status),
                      expiresIn: formatInviteRemaining(exam.inviteRemaining),
                      buttonText: getButtonText(exam.status),
                      examData: exam
                    }}
                    isUpcoming={true}
                  />
                ))
              ) : (
                <div className="no-exams">
                  <p>No upcoming exams found.</p>
                  <p>All your exams will appear here when assigned.</p>
                </div>
              )
            ) : (
              completedExams.length > 0 ? (
                completedExams.map((exam) => (
                  <CandidateExamCard 
                    key={exam.examId} 
                    exam={{
                      id: exam.examId,
                      title: exam.title,
                      status: formatStatus(exam.status),
                      duration: `${exam.duration} minutes`,
                      examData: exam
                    }}
                    isUpcoming={false}
                  />
                ))
              ) : (
                <div className="no-exams">
                  <p>No completed exams yet.</p>
                  <p>Your completed exams will appear here.</p>
                </div>
              )
            )}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && !error && (
          <div className="exam-stats">
            <div className="stat-card">
              <h3>Total Exams</h3>
              <p className="stat-value">{exams.length}</p>
            </div>
            <div className="stat-card">
              <h3>Upcoming</h3>
              <p className="stat-value">{upcomingExams.length}</p>
            </div>
            <div className="stat-card">
              <h3>Completed</h3>
              <p className="stat-value">{completedExams.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidateDashboard;