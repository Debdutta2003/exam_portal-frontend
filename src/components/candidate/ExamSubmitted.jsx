// components/candidate/ExamSubmitted.jsx
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/CandidateExamInterface";

function ExamSubmitted() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { autoSubmitted = false, reason = "", warnings = 0, timeLeft = 0 } = location.state || {};

  return (
    <div className="exam-submitted-page">
      <div className="submitted-container">
        <h1>Exam Submitted</h1>
        
        {autoSubmitted ? (
          <div className="auto-submit-info">
            <div className="icon">⚠️</div>
            <h2>Exam Auto-Submitted</h2>
            <p className="reason">{reason}</p>
            
            {reason.includes("violation") && (
              <div className="violation-details">
                <p><strong>Total Violations:</strong> {warnings}</p>
                <p>Your exam was automatically submitted due to rule violations.</p>
              </div>
            )}
            
            {reason.includes("Time expired") && (
              <div className="time-details">
                <p>Your exam was automatically submitted because the time expired.</p>
                <p><strong>Time Remaining:</strong> 0 minutes</p>
              </div>
            )}
          </div>
        ) : (
          <div className="manual-submit-info">
            <div className="icon">✅</div>
            <h2>Exam Successfully Submitted</h2>
            <p>Your exam responses have been recorded.</p>
          </div>
        )}
        
        <div className="instructions">
          <h3>What happens next?</h3>
          <ul>
            <li>Your answers have been saved</li>
            <li>The exam administrator will evaluate your submission</li>
            <li>You will be notified when results are available</li>
            <li>You can check your dashboard for updates</li>
          </ul>
        </div>
        
        <div className="actions">
          <button 
            className="btn-dashboard"
            onClick={() => navigate("/candidate-dashboard")}
          >
            Return to Dashboard
          </button>
          
          {!autoSubmitted && (
            <button 
              className="btn-review"
              onClick={() => navigate("/candidate-dashboard")}
            >
              View Completed Exams
            </button>
          )}
        </div>
        
        <div className="exam-rules-reminder">
          <h4>Important Notes:</h4>
          <ul>
            <li>Do not close this browser tab until you see the confirmation</li>
            <li>Your session has been securely logged</li>
            <li>Any violations during the exam have been recorded</li>
            <li>Contact support if you believe there was an error</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ExamSubmitted;