import { useParams, useNavigate } from "react-router-dom";
import "../../styles/CandidateExamOverview.css";

function CandidateExamOverview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isCompleted = id === "2"; // dummy logic

  return (
    <div className="exam-overview">
      <h1>Exam Title</h1>
      <span className={`badge ${isCompleted ? "completed" : "pending"}`}>
        {isCompleted ? "Completed" : "Pending"}
      </span>

      <p>Description of the exam...</p>

      <h3>Rules & Regulations</h3>
      <ul>
        <li>Camera must remain ON</li>
        <li>No tab switching allowed</li>
        <li>Auto submit on time expiry</li>
      </ul>

      {!isCompleted && (
        <button onClick={() => navigate(`/system-check/${id}`)}>
          Start Exam
        </button>
      )}
    </div>
  );
}

export default CandidateExamOverview;