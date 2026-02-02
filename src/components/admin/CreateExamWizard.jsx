import { useState } from "react";
import { 
  createExam, 
  publishExam, 
  inviteMultipleCandidates, 
  uploadExamCandidatesCSV,
  uploadQuestionsCSV
} from "../../api/examApi";
import "../../styles/CreateExamWizard.css";

function CreateExamWizard() {
  const [createdExamId, setCreatedExamId] = useState(null);
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [inviting, setInviting] = useState(false); // Add inviting state

  // STEP 1
  const [examDetails, setExamDetails] = useState({
    title: "",
    description: "",
    startDateTime: "",
    endDateTime: "",
    duration: ""
  });

  // STEP 2
  const [questions, setQuestions] = useState([]);
  const [questionsFile, setQuestionsFile] = useState(null);

  // STEP 3
  const [inviteMethod, setInviteMethod] = useState("individual");
  const [candidates, setCandidates] = useState([{ name: "", email: "" }]);
  const [bulkCandidates, setBulkCandidates] = useState([]);
  const [bulkCSVFile, setBulkCSVFile] = useState(null);

  /* ---------------- STEP 1 ---------------- */
  const handleDetailsChange = (e) => {
    setExamDetails({ ...examDetails, [e.target.name]: e.target.value });
  };

  const goToStep2 = async () => {
    if (Object.values(examDetails).some((v) => !v)) {
      alert("Fill all exam details.");
      return;
    }
    
    const start = new Date(examDetails.startDateTime);
    const end = new Date(examDetails.endDateTime);
    const durationMinutes = Number(examDetails.duration);

    if (start >= end) {
      alert("Start time must be before end time.");
      return;
    }

    if (start < new Date()) {
      alert("Start time cannot be in the past.");
      return;
    }

    const diffMinutes = (end - start) / (1000 * 60);
    if (diffMinutes < durationMinutes) {
      alert(
        `Exam duration (${durationMinutes} min) must fit between start and end time.`
      );
      return;
    }

    try {
      const adminId = localStorage.getItem("adminId") || 1;

      const res = await createExam(adminId, {
        title: examDetails.title,
        description: examDetails.description,
        duration: durationMinutes,
        startDate: examDetails.startDateTime,
        endDate: examDetails.endDateTime,
      });

      setCreatedExamId(res.data.id);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Failed to create exam");
    }
  };

  /* ---------------- STEP 2 ---------------- */
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setQuestionsFile(file);

    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const rows = target.result.split("\n").slice(1);
      
      const parsed = rows
        .map((row) => {
          const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          if (cols.length >= 7) {
            return cols.map(col => col.replace(/^"|"$/g, '').trim());
          }
          return null;
        })
        .filter(cols => cols !== null)
        .map((cols, idx) => ({
          id: idx + 1,
          question: cols[0] || "",
          options: [
            cols[1] || "",
            cols[2] || "",
            cols[3] || "",
            cols[4] || ""
          ],
          correctAnswer: cols[5] || "",
          marks: Number(cols[6]) || 0
        }));
      
      setQuestions(parsed);
    };
    reader.readAsText(file);
  };

  const goToStep3 = async () => {
    if (!questionsFile) {
      alert("Please upload a CSV file with questions.");
      return;
    }

    if (questions.length === 0) {
      alert("CSV file is empty or invalid format.");
      return;
    }

    try {
      setUploading(true);
      
      // Upload the CSV file
      await uploadQuestionsCSV(createdExamId, questionsFile);
      
      // Publish the exam
      await publishExam(createdExamId);
      
      setStep(3);
    } catch (err) {
      console.error("Upload error:", err);
      
      if (err.response?.status === 403) {
        alert("Access denied. Please check your authentication.");
      } else if (err.response?.status === 400) {
        alert("Invalid CSV format. Please check your file.");
      } else {
        alert("Failed to upload questions. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- STEP 3 ---------------- */
  const addCandidateField = () => {
    setCandidates([...candidates, { name: "", email: "" }]);
  };
  
  const updateCandidate = (index, field, value) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };
  
  const removeCandidateField = (index) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };
  
  const handleBulkCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBulkCSVFile(file);

    // Parse for preview
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      const rows = target.result.split("\n").slice(1);
      
      const parsed = rows
        .map((row) => {
          const cols = row.split(",");
          if (cols.length >= 2) {
            return {
              name: cols[0]?.trim(),
              email: cols[1]?.trim()
            };
          }
          return null;
        })
        .filter(candidate => candidate !== null && candidate.name && candidate.email);
      
      setBulkCandidates(parsed);
    };
    reader.readAsText(file);
  };

  const finishCreatingExam = async () => {
    try {
      setInviting(true);
      
      if (inviteMethod === "individual") {
        // Call candidate-multiple-invite endpoint for manual entries
        console.log("Sending candidates:", candidates);
        await inviteMultipleCandidates(createdExamId, candidates);
      } else {
        // Bulk CSV upload - call candidates/upload endpoint
        if (!bulkCSVFile) {
          alert("Please upload a CSV file for candidates.");
          setInviting(false);
          return;
        }
        
        console.log("Uploading CSV file:", bulkCSVFile.name);
        await uploadExamCandidatesCSV(createdExamId, bulkCSVFile);
      }

      alert("Exam created and candidates invited successfully ✅");
      
      // Reset the form
      resetForm();
    } catch (err) {
      console.error("Invitation error:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 400) {
        alert("Invalid data format. Please check the candidate details.");
      } else if (err.response?.status === 403) {
        alert("Access denied. Please check your authentication.");
      } else {
        alert("Candidate invitation failed. Please try again.");
      }
    } finally {
      setInviting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setExamDetails({
      title: "",
      description: "",
      startDateTime: "",
      endDateTime: "",
      duration: ""
    });
    setQuestions([]);
    setQuestionsFile(null);
    setCandidates([{ name: "", email: "" }]);
    setBulkCandidates([]);
    setBulkCSVFile(null);
    setCreatedExamId(null);
  };

  return (
    <div className="wizard-container">
      {/* STEPS HEADER */}
      <div className="wizard-steps">
        <span className={step === 1 ? "active" : ""}>1. Exam Details</span>
        <span className={step === 2 ? "active" : ""}>2. Upload Questions</span>
        <span className={step === 3 ? "active" : ""}>3. Invite Students</span>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="wizard-step">
          <input name="title" placeholder="Exam Title" value={examDetails.title} onChange={handleDetailsChange} />
          <textarea name="description" placeholder="Description" value={examDetails.description} onChange={handleDetailsChange} />
          <input type="datetime-local" name="startDateTime" value={examDetails.startDateTime} onChange={handleDetailsChange} />
          <input type="datetime-local" name="endDateTime" value={examDetails.endDateTime} onChange={handleDetailsChange} />
          <input type="number" name="duration" placeholder="Duration (minutes)" value={examDetails.duration} onChange={handleDetailsChange} />
          <button className="next-btn" onClick={goToStep2}>Next</button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="wizard-step">
          <div className="upload-section">
            <h3>Upload Questions CSV</h3>
            <div className="format-info">
              <p><strong>CSV Format:</strong></p>
              <p>text, optionA, optionB, optionC, optionD, correctOption, marks</p>
              <p><small>Example: "What is JVM?","Java Virtual Machine","Java Variable Method","Java Verified Mode","None","A",5</small></p>
            </div>
            
            <div className="file-upload-area">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleCSVUpload} 
                id="questions-csv-upload"
              />
              <label htmlFor="questions-csv-upload" className="upload-label">
                {questionsFile ? questionsFile.name : "Choose CSV File"}
              </label>
            </div>

            {questions.length > 0 && (
              <div className="question-preview">
                <h4>Preview ({questions.length} questions)</h4>
                <table>
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
                          <strong>A:</strong> {q.options[0]}<br/>
                          <strong>B:</strong> {q.options[1]}<br/>
                          <strong>C:</strong> {q.options[2]}<br/>
                          <strong>D:</strong> {q.options[3]}
                        </td>
                        <td>{q.correctAnswer}</td>
                        <td>{q.marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {questions.length > 5 && (
                  <p className="more-questions">... and {questions.length - 5} more questions</p>
                )}
                
                <div className="total-marks">
                  <p><strong>Total Marks:</strong> {questions.reduce((sum, q) => sum + q.marks, 0)}</p>
                </div>
              </div>
            )}

            <div className="step-actions">
              <button 
                className="next-btn" 
                onClick={goToStep3}
                disabled={!questionsFile || uploading}
              >
                {uploading ? "Uploading and Publishing..." : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="wizard-step">
          <h3 className="section-title">Invite Candidates</h3>

          <div className="invite-method-row">
            <label className="radio-option">
              <input
                type="radio"
                name="inviteMethod"
                value="individual"
                checked={inviteMethod === "individual"}
                onChange={() => setInviteMethod("individual")}
              />
              Manual Entry
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="inviteMethod"
                value="bulk"
                checked={inviteMethod === "bulk"}
                onChange={() => setInviteMethod("bulk")}
              />
              Bulk CSV Upload
            </label>
          </div>

          {/* MANUAL ENTRY */}
          {inviteMethod === "individual" && (
            <div className="invite-section">
              <label>Add Candidates Manually</label>
              
              {candidates.map((candidate, index) => (
                <div className="email-row" key={index}>
                  <input
                    type="text"
                    placeholder="Candidate Name"
                    value={candidate.name}
                    onChange={(e) => updateCandidate(index, "name", e.target.value)}
                    required
                  />
                  
                  <input
                    type="email"
                    placeholder="Candidate Email"
                    value={candidate.email}
                    onChange={(e) => updateCandidate(index, "email", e.target.value)}
                    required
                  />
                  
                  {candidates.length > 1 && (
                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => removeCandidateField(index)}
                      title="Remove"
                    >
                      🗑
                    </button>
                  )}
                </div>
              ))}
              
              <div className="candidate-count">
                <p>{candidates.length} candidate(s) added</p>
              </div>
              
              <button
                type="button"
                className="secondary-btn"
                onClick={addCandidateField}
              >
                + Add Another Candidate
              </button>
            </div>
          )}

          {/* BULK CSV UPLOAD */}
          {inviteMethod === "bulk" && (
            <div className="invite-section">
              <label>Upload Candidates CSV</label>
              <div className="format-info">
                <p><strong>CSV Format:</strong> Name, Email</p>
                <p><small>Example: John Doe,john@example.com</small></p>
              </div>
              
              <div className="file-upload-area">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleBulkCSV} 
                  id="candidates-csv-upload"
                />
                <label htmlFor="candidates-csv-upload" className="upload-label">
                  {bulkCSVFile ? bulkCSVFile.name : "Choose CSV File"}
                </label>
              </div>
              
              {bulkCandidates.length > 0 && (
                <div className="candidate-preview">
                  <h4>Preview ({bulkCandidates.length} candidates)</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkCandidates.slice(0, 5).map((c, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{c.name}</td>
                          <td>{c.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {bulkCandidates.length > 5 && (
                    <p className="more-candidates">... and {bulkCandidates.length - 5} more candidates</p>
                  )}
                </div>
              )}
            </div>
          )}

          <button 
            className="finish-btn" 
            onClick={finishCreatingExam}
            disabled={inviting}
          >
            {inviting ? "Inviting Candidates..." : "Finish & Send Invitations"}
          </button>
        </div>
      )}
    </div>
  );
}

export default CreateExamWizard;