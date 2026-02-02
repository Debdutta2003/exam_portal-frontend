import "../../styles/CandidateSidebar.css";

function CandidateSidebar({ setActiveTab }) {
  return (
    <div className="candidate-sidebar">
      <h2>Candidate Panel</h2>

      <button onClick={() => setActiveTab("upcoming")}>
        Upcoming Exams
      </button>

      <button onClick={() => setActiveTab("completed")}>
        Completed Exams
      </button>
    </div>
  );
}

export default CandidateSidebar;