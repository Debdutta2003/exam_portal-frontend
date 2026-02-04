import { useState } from "react";
import { uploadQuestionsCSV } from "../../api/examApi";
import "../../styles/Modal.css";

function AddQuestionsModal({ examId, examTitle, onClose }) {
  const [questionsFile, setQuestionsFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setQuestionsFile(file);
    setQuestions([]);
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const rows = target.result
        .split("\n")
        .slice(1)
        .filter(row => row.trim() !== "");

      const parsed = rows
        .map((row, idx) => {
          const cols = row
            .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            .map(col => col.replace(/^"|"$/g, "").trim());

          if (cols.length < 7) return null;

          return {
            id: idx + 1,
            question: cols[0],
            options: [cols[1], cols[2], cols[3], cols[4]],
            correctAnswer: cols[5].toUpperCase(),
            marks: Number(cols[6]) || 0
          };
        })
        .filter(Boolean);

      setQuestions(parsed);
    };

    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!questionsFile) return alert("Please select a CSV file first.");
    if (!questions.length) return alert("CSV file is empty or invalid.");

    setUploading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login again. Token not found.");
      setUploading(false);
      return;
    }

    try {
      await uploadQuestionsCSV(examId, questionsFile);
      setUploadSuccess(true);
      alert(`✅ Successfully uploaded ${questions.length} questions!`);
      setTimeout(onClose, 1500);
    } catch (error) {
      console.error(error);
      alert("Failed to upload questions.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Add Questions to: {examTitle}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="upload-section">
            <h3>Upload Questions CSV</h3>

            <input type="file" accept=".csv" onChange={handleCSVUpload} />

            {/* Preview section */}
            {questions.length > 0 && (
              <div className="question-preview">
                <h4>Preview ({questions.length} questions)</h4>

                <div className="preview-table-container">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Question</th>
                        <th>Options</th>
                        <th>Correct</th>
                        <th>Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.slice(0, 5).map((q) => (
                        <tr key={q.id}>
                          <td>{q.id}</td>
                          <td>{q.question}</td>
                          <td>
                            <div><strong>A:</strong> {q.options[0]}</div>
                            <div><strong>B:</strong> {q.options[1]}</div>
                            <div><strong>C:</strong> {q.options[2]}</div>
                            <div><strong>D:</strong> {q.options[3]}</div>
                          </td>
                          <td className="correct-answer">{q.correctAnswer}</td>
                          <td>{q.marks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {questions.length > 5 && (
                  <p className="more-questions">
                    ... and {questions.length - 5} more questions
                  </p>
                )}

                <div className="total-marks">
                  <p><strong>Total Marks:</strong> {questions.reduce((s, q) => s + q.marks, 0)}</p>
                  <p><strong>Total Questions:</strong> {questions.length}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} disabled={uploading}>Cancel</button>
          <button
            onClick={handleUpload}
            disabled={!questionsFile || uploading || uploadSuccess}
          >
            {uploading ? "Uploading..." : uploadSuccess ? "✓ Uploaded!" : "Upload Questions"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddQuestionsModal;
