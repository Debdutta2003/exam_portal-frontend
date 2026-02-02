import { useNavigate } from "react-router-dom";
import "../../styles/CandidateExamCard.css";

function CandidateExamCard({ exam, isUpcoming }) {
  const { 
    id, 
    title, 
    duration, 
    status, 
    expiresIn,
    buttonText = "Start Exam" 
  } = exam;
  const navigate = useNavigate();

  const handleStartExam = () => {
    if (!id) {
      alert("Cannot start exam: Exam ID missing");
      return;
    }
    navigate(`/system-check/${id}`);
  };

  return (
    <div className={`exam-card ${isUpcoming ? '' : 'completed'}`}>
      <div className="exam-header">
        <h3>{title}</h3>
        {status && (
          <span className={`status-badge ${status.toLowerCase().split(' ')[0]}`}>
            {status}
          </span>
        )}
      </div>
      
      <div className="exam-details">
        {isUpcoming ? (
          <>
            <p><strong>Duration:</strong> {duration}</p>
            <p><strong>Status:</strong> {status || "Unknown"}</p>
            {expiresIn && <p><strong>Expires In:</strong> {expiresIn}</p>}
            <p><strong>Exam ID:</strong> {id || "N/A"}</p>
          </>
        ) : (
          <>
            <p><strong>Status:</strong> {status || "Unknown"}</p>
            <p><strong>Duration:</strong> {duration}</p>
            <p><strong>Exam ID:</strong> {id || "N/A"}</p>
          </>
        )}
      </div>
      
      {isUpcoming && (
        <div className="exam-actions">
          <button 
            className={`btn-start ${
              status?.toLowerCase().includes('invited') ? 'invited' :
              status?.toLowerCase().includes('pending') ? 'pending' :
              status?.toLowerCase().includes('ongoing') ? 'ongoing' : ''
            }`}
            onClick={handleStartExam}
            disabled={expiresIn === "Expired" || !id}
          >
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
}

export default CandidateExamCard;