// import { useState, useEffect } from "react";
// import { getExams, publishExam } from "../../api/examApi";
// import AddQuestionsModal from "./AddQuestionsModal";
// import AssignCandidatesModal from "./AssignCandidatesModal";
// import "../../styles/ExamTable.css";

// function ExamTable({ onMonitorExam }) {
//   const [exams, setExams] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showAddQuestionsModal, setShowAddQuestionsModal] = useState(false);
//   const [showAssignCandidatesModal, setShowAssignCandidatesModal] = useState(false);
//   const [selectedExam, setSelectedExam] = useState(null);
//   const [publishing, setPublishing] = useState({});

//   useEffect(() => {
//     fetchExams();
//   }, []);

//   const fetchExams = async () => {
//     try {
//       setLoading(true);
//       const response = await getExams();
//       console.log("Exams data:", response.data);
//       setExams(response.data || []);
//     } catch (error) {
//       console.error("Error fetching exams:", error);
//       alert("Failed to load exams");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePublishExam = async (examId) => {
//     if (!window.confirm("Are you sure you want to publish this exam? Once published, you can assign candidates.")) {
//       return;
//     }

//     try {
//       setPublishing(prev => ({ ...prev, [examId]: true }));
      
//       // Check token before publishing
//       const token = localStorage.getItem("token");
//       if (!token) {
//         alert("Please login again. Token not found.");
//         return;
//       }
      
//       console.log(`Publishing exam ${examId}...`);
//       await publishExam(examId);
      
//       alert("Exam published successfully! You can now assign candidates.");
//       await fetchExams(); // Refresh the list
//     } catch (error) {
//       console.error("Error publishing exam:", error);
      
//       if (error.response?.status === 403) {
//         alert("Access denied (403). Please check your authentication token is valid.");
//       } else if (error.response?.data?.message) {
//         alert(`Failed to publish: ${error.response.data.message}`);
//       } else {
//         alert("Failed to publish exam. Please try again.");
//       }
//     } finally {
//       setPublishing(prev => ({ ...prev, [examId]: false }));
//     }
//   };

//   const handleAddQuestions = (exam) => {
//     setSelectedExam(exam);
//     setShowAddQuestionsModal(true);
//   };

//   const handleAssignCandidates = (exam) => {
//     if (exam.status === "DRAFT") {
//       alert("Please publish the exam before inviting candidates.");
//       return;
//     }
//     setSelectedExam(exam);
//     setShowAssignCandidatesModal(true);
//   };

//   const formatDateTime = (dateTimeString) => {
//     if (!dateTimeString) return "Not set";
//     try {
//       return new Date(dateTimeString).toLocaleString();
//     } catch (error) {
//       return dateTimeString;
//     }
//   };

//   const getStatusBadge = (status) => {
//     const statusText = status || "UNKNOWN";
//     switch (statusText.toUpperCase()) {
//       case "PUBLISHED":
//         return <span className="status-badge published">Published</span>;
//       case "DRAFT":
//         return <span className="status-badge draft">Draft</span>;
//       case "COMPLETED":
//         return <span className="status-badge completed">Completed</span>;
//       case "ACTIVE":
//         return <span className="status-badge active">Active</span>;
//       default:
//         return <span className="status-badge unknown">{statusText}</span>;
//     }
//   };

//   const isExamActive = (exam) => {
//     if (!exam.startDate || !exam.endDate) return false;
//     try {
//       const now = new Date();
//       const start = new Date(exam.startDate);
//       const end = new Date(exam.endDate);
//       return now >= start && now <= end;
//     } catch (error) {
//       return false;
//     }
//   };

//   const handleModalClose = () => {
//     setShowAddQuestionsModal(false);
//     setShowAssignCandidatesModal(false);
//     setSelectedExam(null);
//     fetchExams(); // Refresh exams after modal actions
//   };

//   const getExamActions = (exam) => {
//     const status = exam.status?.toUpperCase() || "DRAFT";
    
//     switch (status) {
//       case "DRAFT":
//         return (
//           <>
//             <button 
//               className="btn-action btn-add-questions"
//               onClick={() => handleAddQuestions(exam)}
//             >
//               Add Questions
//             </button>
//             <button
//               className="btn-publish"
//               onClick={() => handlePublishExam(exam.id)}
//               disabled={publishing[exam.id]}
//             >
//               {publishing[exam.id] ? "Publishing..." : "Publish Exam"}
//             </button>
//           </>
//         );
        
//       case "PUBLISHED":
//         // Check if exam is currently active
//         if (isExamActive(exam)) {
//           return (
//             <button 
//               className="btn-action btn-monitor"
//               onClick={() => onMonitorExam(exam.id)}
//             >
//               Monitor Exam
//             </button>
//           );
//         } else {
//           // Not active yet, can assign candidates
//           return (
//             <button 
//               className="btn-action btn-assign-candidates"
//               onClick={() => handleAssignCandidates(exam)}
//             >
//               Assign Candidates
//             </button>
//           );
//         }
        
//       case "COMPLETED":
//         return (
//           <button 
//             className="btn-action btn-view-results"
//             onClick={() => onMonitorExam(exam.id)}
//           >
//             View Results
//           </button>
//         );
        
//       case "ACTIVE":
//         return (
//           <button 
//             className="btn-action btn-monitor"
//             onClick={() => onMonitorExam(exam.id)}
//           >
//             Monitor Exam
//           </button>
//         );
        
//       default:
//         return <span className="no-actions">No actions available</span>;
//     }
//   };

//   const getExamStage = (exam) => {
//     const status = exam.status?.toUpperCase() || "DRAFT";
    
//     switch (status) {
//       case "DRAFT":
//         return "Add Questions & Publish";
//       case "PUBLISHED":
//         if (isExamActive(exam)) {
//           return "Active - Monitor";
//         } else {
//           return "Ready - Assign Candidates";
//         }
//       case "ACTIVE":
//         return "Active - Monitor";
//       case "COMPLETED":
//         return "Completed - View Results";
//       default:
//         return "Unknown";
//     }
//   };

//   if (loading) {
//     return <div className="loading">Loading exams...</div>;
//   }

//   return (
//     <div className="exam-table-container">
//       {exams.length === 0 ? (
//         <div className="no-exams">
//           <p>No exams created yet</p>
//           <p className="hint">Click "Create New Exam" to get started</p>
//         </div>
//       ) : (
//         <>
//           <table className="exams-table">
//             <thead>
//               <tr>
//                 <th>Exam Title</th>
//                 <th>Status</th>
//                 <th>Stage</th>
//                 <th>Duration</th>
//                 <th>Start Date</th>
//                 <th>End Date</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {exams.map((exam) => (
//                 <tr key={exam.id}>
//                   <td className="exam-title">
//                     <strong>{exam.title || "Untitled Exam"}</strong>
//                     {exam.description && (
//                       <small className="exam-desc">{exam.description}</small>
//                     )}
//                     <small>ID: {exam.id}</small>
//                   </td>
//                   <td>
//                     {getStatusBadge(exam.status)}
//                   </td>
//                   <td>
//                     <span className="exam-stage">{getExamStage(exam)}</span>
//                   </td>
//                   <td>{exam.duration || 0} minutes</td>
//                   <td>{formatDateTime(exam.startDate)}</td>
//                   <td>{formatDateTime(exam.endDate)}</td>
//                   <td>
//                     <div className="action-buttons">
//                       {getExamActions(exam)}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
          
//           <div className="table-footer">
//             <p>Total Exams: {exams.length}</p>
//             <div className="legend">
//               <span className="legend-item">
//                 <span className="legend-dot draft"></span> Draft
//               </span>
//               <span className="legend-item">
//                 <span className="legend-dot published"></span> Published
//               </span>
//               <span className="legend-item">
//                 <span className="legend-dot active"></span> Active/Completed
//               </span>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Add Questions Modal */}
//       {showAddQuestionsModal && selectedExam && (
//         <AddQuestionsModal
//           examId={selectedExam.id}
//           examTitle={selectedExam.title}
//           onClose={handleModalClose}
//         />
//       )}

//       {/* Assign Candidates Modal */}
//       {showAssignCandidatesModal && selectedExam && (
//         <AssignCandidatesModal
//           examId={selectedExam.id}
//           examTitle={selectedExam.title}
//           onClose={handleModalClose}
//         />
//       )}
//     </div>
//   );
// }

// export default ExamTable;



import { useState, useEffect } from "react";
import { getExams, publishExam } from "../../api/examApi";
import { jwtDecode } from "jwt-decode";
import AddQuestionsModal from "./AddQuestionsModal";
import AssignCandidatesModal from "./AssignCandidatesModal";
import "../../styles/ExamTable.css";

function ExamTable({ onMonitorExam }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddQuestionsModal, setShowAddQuestionsModal] = useState(false);
  const [showAssignCandidatesModal, setShowAssignCandidatesModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [publishing, setPublishing] = useState({});

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await getExams();
      console.log("Exams data:", response.data);
      setExams(response.data || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
      alert("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishExam = async (examId) => {
    if (!window.confirm("Are you sure you want to publish this exam? Once published, you can assign candidates.")) {
      return;
    }

    try {
      setPublishing(prev => ({ ...prev, [examId]: true }));
      
      // Check token before publishing
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again. Token not found.");
        return;
      }
      
      console.log(`📤 Publishing exam ${examId}...`);
      await publishExam(examId);
      
      alert("✅ Exam published successfully! You can now assign candidates.");
      await fetchExams(); // Refresh the list
    } catch (error) {
      console.error("❌ Error publishing exam:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.status === 403) {
        alert(`🔒 Access denied (403). 
        
Details: ${error.response?.data?.message || 'No additional details'}

Please check:
1. Token is valid and not expired
2. You have admin permissions
3. Exam has questions added before publishing
4. Backend is running properly`);
        
      } else if (error.response?.data?.message) {
        alert(`❌ Failed to publish: ${error.response.data.message}`);
      } else {
        alert("❌ Failed to publish exam. Please try again.");
      }
    } finally {
      setPublishing(prev => ({ ...prev, [examId]: false }));
    }
  };

  const handleAddQuestions = (exam) => {
    setSelectedExam(exam);
    setShowAddQuestionsModal(true);
  };

  const handleAssignCandidates = (exam) => {
    if (exam.status === "DRAFT") {
      alert("Please publish the exam before inviting candidates.");
      return;
    }
    setSelectedExam(exam);
    setShowAssignCandidatesModal(true);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Not set";
    try {
      return new Date(dateTimeString).toLocaleString();
    } catch (error) {
      return dateTimeString;
    }
  };

  const getStatusBadge = (status) => {
    const statusText = status || "UNKNOWN";
    switch (statusText.toUpperCase()) {
      case "PUBLISHED":
        return <span className="status-badge published">Published</span>;
      case "DRAFT":
        return <span className="status-badge draft">Draft</span>;
      case "COMPLETED":
        return <span className="status-badge completed">Completed</span>;
      case "ACTIVE":
        return <span className="status-badge active">Active</span>;
      default:
        return <span className="status-badge unknown">{statusText}</span>;
    }
  };

  const isExamActive = (exam) => {
    if (!exam.startDate || !exam.endDate) return false;
    try {
      const now = new Date();
      const start = new Date(exam.startDate);
      const end = new Date(exam.endDate);
      return now >= start && now <= end;
    } catch (error) {
      return false;
    }
  };

  const handleModalClose = () => {
    setShowAddQuestionsModal(false);
    setShowAssignCandidatesModal(false);
    setSelectedExam(null);
    fetchExams(); // Refresh exams after modal actions
  };

  const getExamActions = (exam) => {
    const status = exam.status?.toUpperCase() || "DRAFT";
    
    switch (status) {
      case "DRAFT":
        return (
          <div className="draft-actions">
            <button 
              className="btn-action btn-add-questions"
              onClick={() => handleAddQuestions(exam)}
            >
              Add Questions
            </button>
            <button
              className="btn-action btn-publish"
              onClick={() => handlePublishExam(exam.id)}
              disabled={publishing[exam.id]}
            >
              {publishing[exam.id] ? "Publishing..." : "Publish Exam"}
            </button>
          </div>
        );
        
      case "PUBLISHED":
        // Check if exam is currently active
        if (isExamActive(exam)) {
          return (
            <button 
              className="btn-action btn-monitor"
              onClick={() => onMonitorExam(exam.id)}
            >
              Monitor Exam
            </button>
          );
        } else {
          // Not active yet, can assign candidates
          return (
            <button 
              className="btn-action btn-assign-candidates"
              onClick={() => handleAssignCandidates(exam)}
            >
              Assign Candidates
            </button>
          );
        }
        
      case "COMPLETED":
        return (
          <button 
            className="btn-action btn-view-results"
            onClick={() => onMonitorExam(exam.id)}
          >
            View Results
          </button>
        );
        
      case "ACTIVE":
        return (
          <button 
            className="btn-action btn-monitor"
            onClick={() => onMonitorExam(exam.id)}
          >
            Monitor Exam
          </button>
        );
        
      default:
        return <span className="no-actions">No actions available</span>;
    }
  };

  const getExamStage = (exam) => {
    const status = exam.status?.toUpperCase() || "DRAFT";
    
    switch (status) {
      case "DRAFT":
        return "Add Questions & Publish";
      case "PUBLISHED":
        if (isExamActive(exam)) {
          return "Active - Monitor";
        } else {
          return "Ready - Assign Candidates";
        }
      case "ACTIVE":
        return "Active - Monitor";
      case "COMPLETED":
        return "Completed - View Results";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return <div className="loading">Loading exams...</div>;
  }

  return (
    <div className="exam-table-container">
      {exams.length === 0 ? (
        <div className="no-exams">
          <p>No exams created yet</p>
          <p className="hint">Click "Create New Exam" to get started</p>
        </div>
      ) : (
        <>
          <table className="exams-table">
            <thead>
              <tr>
                <th>Exam Title</th>
                <th>Status</th>
                <th>Stage</th>
                <th>Duration</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td className="exam-title">
                    <strong>{exam.title || "Untitled Exam"}</strong>
                    {exam.description && (
                      <small className="exam-desc">{exam.description}</small>
                    )}
                    <small>ID: {exam.id}</small>
                  </td>
                  <td>
                    {getStatusBadge(exam.status)}
                  </td>
                  <td>
                    <span className="exam-stage">{getExamStage(exam)}</span>
                  </td>
                  <td>{exam.duration || 0} minutes</td>
                  <td>{formatDateTime(exam.startDate)}</td>
                  <td>{formatDateTime(exam.endDate)}</td>
                  <td>
                    <div className="action-buttons">
                      {getExamActions(exam)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="table-footer">
            <p>Total Exams: {exams.length}</p>
            <div className="legend">
              <span className="legend-item">
                <span className="legend-dot draft"></span> Draft: Add Questions & Publish
              </span>
              <span className="legend-item">
                <span className="legend-dot published"></span> Published: Assign Candidates
              </span>
              <span className="legend-item">
                <span className="legend-dot active"></span> Active/Completed: Monitor
              </span>
            </div>
          </div>
        </>
      )}

      {/* Add Questions Modal */}
      {showAddQuestionsModal && selectedExam && (
        <AddQuestionsModal
          examId={selectedExam.id}
          examTitle={selectedExam.title}
          onClose={handleModalClose}
        />
      )}

      {/* Assign Candidates Modal */}
      {showAssignCandidatesModal && selectedExam && (
        <AssignCandidatesModal
          examId={selectedExam.id}
          examTitle={selectedExam.title}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

export default ExamTable;