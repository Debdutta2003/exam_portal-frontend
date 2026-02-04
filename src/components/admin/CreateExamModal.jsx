// import { useState } from "react";
// import { createExam } from "../../api/examApi";
// import { jwtDecode } from "jwt-decode";
// import "../../styles/CreateExamModal.css";

// function CreateExamModal({ onClose }) {
//   const [loading, setLoading] = useState(false);
//   const [examDetails, setExamDetails] = useState({
//     title: "",
//     description: "",
//     startDate: "",
//     endDate: "",
//     duration: ""
//   });

//   const handleChange = (e) => {
//     setExamDetails({
//       ...examDetails,
//       [e.target.name]: e.target.value
//     });
//   };

//   const formatDateForAPI = (dateTimeLocal) => {
//     if (!dateTimeLocal) return "";
//     // Convert from "YYYY-MM-DDTHH:mm" to "YYYY-MM-DD HH:mm:ss"
//     return dateTimeLocal.replace("T", " ") + ":00";
//   };

//   const checkTokenValidity = () => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       alert("Please login again. No authentication token found.");
//       return false;
//     }

//     try {
//       const decoded = jwtDecode(token);
//       const isExpired = decoded.exp * 1000 < Date.now();
      
//       if (isExpired) {
//         alert("Your session has expired. Please login again.");
//         localStorage.removeItem("token");
//         return false;
//       }
      
//       return true;
//     } catch (error) {
//       console.error("Token decode error:", error);
//       alert("Invalid authentication token. Please login again.");
//       return false;
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Check token validity first
//     if (!checkTokenValidity()) {
//       return;
//     }
    
//     // Validation
//     if (Object.values(examDetails).some(v => !v)) {
//       alert("Please fill all fields");
//       return;
//     }

//     const start = new Date(examDetails.startDate);
//     const end = new Date(examDetails.endDate);
//     const duration = parseInt(examDetails.duration);

//     if (duration <= 0) {
//       alert("Duration must be greater than 0");
//       return;
//     }

//     if (start >= end) {
//       alert("Start time must be before end time");
//       return;
//     }

//     if (start < new Date()) {
//       alert("Start time cannot be in the past");
//       return;
//     }

//     const totalMinutes = (end - start) / (1000 * 60);
//     if (duration > totalMinutes) {
//       alert(`Exam duration (${duration} min) cannot exceed time between start and end (${Math.floor(totalMinutes)} min)`);
//       return;
//     }

//     try {
//       setLoading(true);
      
//       // Get adminId from token
//       const token = localStorage.getItem("token");
//       let adminId = "1"; // default
      
//       try {
//         const decoded = jwtDecode(token);
//         // If your token contains adminId, extract it
//         // Otherwise use default or get from localStorage
//         if (decoded.adminId) {
//           adminId = decoded.adminId;
//         } else if (localStorage.getItem("adminId")) {
//           adminId = localStorage.getItem("adminId");
//         }
//       } catch (error) {
//         console.log("Using default adminId");
//       }
      
//       // Format dates for API
//       const examData = {
//         title: examDetails.title,
//         description: examDetails.description,
//         duration: duration,
//         startDate: formatDateForAPI(examDetails.startDate),
//         endDate: formatDateForAPI(examDetails.endDate)
//       };

//       console.log("Creating exam with data:", examData);
//       console.log("Admin ID:", adminId);
//       console.log("Token exists:", !!localStorage.getItem("token"));
      
//       const response = await createExam(adminId, examData);
//       console.log("Exam created:", response.data);
      
//       alert(`✅ Exam "${examDetails.title}" created successfully! Status: DRAFT\n\nNext steps:\n1. Add questions\n2. Publish the exam\n3. Assign candidates`);
      
//       onClose(); // Close modal
      
//       // Refresh the page to show new exam
//       setTimeout(() => {
//         window.location.reload();
//       }, 1500);
      
//     } catch (error) {
//       console.error("Error creating exam:", error);
      
//       if (error.response?.status === 403) {
//         alert("Access denied (403). Possible reasons:\n1. Invalid or expired token\n2. Insufficient permissions\n3. Backend authentication issue\n\nPlease login again.");
        
//         // Clear token and redirect to login
//         localStorage.removeItem("token");
//         setTimeout(() => {
//           window.location.href = "/login";
//         }, 2000);
        
//       } else if (error.response?.data?.message) {
//         alert(`Failed to create exam: ${error.response.data.message}`);
//       } else if (error.message) {
//         alert(`Failed to create exam: ${error.message}`);
//       } else {
//         alert("Failed to create exam. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getMinEndDate = () => {
//     if (!examDetails.startDate) return "";
//     const start = new Date(examDetails.startDate);
//     start.setMinutes(start.getMinutes() + 1);
//     return start.toISOString().slice(0, 16);
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal-container">
//         <div className="modal-header">
//           <h2>Create New Exam</h2>
//           <button className="modal-close" onClick={onClose}>×</button>
//         </div>
        
//         <form onSubmit={handleSubmit}>
//           <div className="modal-body">
//             <div className="auth-status">
//               <p className={`auth-status-text ${localStorage.getItem("token") ? "auth-valid" : "auth-invalid"}`}>
//                 {localStorage.getItem("token") ? "✅ Authentication: Valid" : "❌ Authentication: Missing"}
//               </p>
//             </div>
            
//             <div className="form-group">
//               <label htmlFor="title">Exam Title *</label>
//               <input
//                 type="text"
//                 id="title"
//                 name="title"
//                 value={examDetails.title}
//                 onChange={handleChange}
//                 placeholder="Enter exam title"
//                 required
//                 minLength="3"
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="description">Description *</label>
//               <textarea
//                 id="description"
//                 name="description"
//                 value={examDetails.description}
//                 onChange={handleChange}
//                 placeholder="Enter exam description"
//                 rows="3"
//                 required
//                 minLength="10"
//               />
//             </div>

//             <div className="form-row">
//               <div className="form-group">
//                 <label htmlFor="startDate">Start Date & Time *</label>
//                 <input
//                   type="datetime-local"
//                   id="startDate"
//                   name="startDate"
//                   value={examDetails.startDate}
//                   onChange={handleChange}
//                   min={new Date().toISOString().slice(0, 16)}
//                   required
//                 />
//               </div>

//               <div className="form-group">
//                 <label htmlFor="endDate">End Date & Time *</label>
//                 <input
//                   type="datetime-local"
//                   id="endDate"
//                   name="endDate"
//                   value={examDetails.endDate}
//                   onChange={handleChange}
//                   min={getMinEndDate()}
//                   required
//                 />
//               </div>
//             </div>

//             <div className="form-group">
//               <label htmlFor="duration">Duration (minutes) *</label>
//               <input
//                 type="number"
//                 id="duration"
//                 name="duration"
//                 value={examDetails.duration}
//                 onChange={handleChange}
//                 placeholder="e.g., 60"
//                 min="1"
//                 max="480"
//                 required
//               />
//               <small className="hint">Exam duration must fit between start and end time</small>
//             </div>
//           </div>

//           <div className="modal-footer">
//             <button 
//               type="button" 
//               className="btn-cancel" 
//               onClick={onClose}
//               disabled={loading}
//             >
//               Cancel
//             </button>
//             <button 
//               type="submit" 
//               className="btn-submit" 
//               disabled={loading}
//             >
//               {loading ? "Creating..." : "Create Exam"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default CreateExamModal;
import { useState } from "react";
import { createExam } from "../../api/examApi";
import { jwtDecode } from "jwt-decode";
import "../../styles/CreateExamModal.css";

function CreateExamModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [examDetails, setExamDetails] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    duration: ""
  });

  const handleChange = (e) => {
    setExamDetails({
      ...examDetails,
      [e.target.name]: e.target.value
    });
  };

  const formatDateForAPI = (dateTimeLocal) => {
    if (!dateTimeLocal) return "";
    // Convert from "YYYY-MM-DDTHH:mm" to "YYYY-MM-DDTHH:mm:ss" (ISO format)
    // Backend expects: "2026-01-01T10:00:00" NOT "2026-01-01 10:00:00"
    return dateTimeLocal + ":00"; // Just add seconds, keep the T
  };

  // Extract adminId from JWT token
  const extractAdminIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return null;
    }

    try {
      const decoded = jwtDecode(token);
      console.log("Token decoded:", decoded);
      
      // Check different possible fields for adminId
      if (decoded.userId) {
        console.log("Found adminId in userId field:", decoded.userId);
        return decoded.userId.toString();
      }
      if (decoded.id) {
        console.log("Found adminId in id field:", decoded.id);
        return decoded.id.toString();
      }
      if (decoded.sub) {
        console.log("Found adminId in sub field:", decoded.sub);
        return decoded.sub.toString();
      }
      if (decoded.adminId) {
        console.log("Found adminId in adminId field:", decoded.adminId);
        return decoded.adminId.toString();
      }
      
      console.warn("No adminId found in token. Available fields:", Object.keys(decoded));
      return null;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check token first
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login again. No authentication token found.");
      return;
    }
    
    // Validation
    if (Object.values(examDetails).some(v => !v)) {
      alert("Please fill all fields");
      return;
    }

    const start = new Date(examDetails.startDate);
    const end = new Date(examDetails.endDate);
    const duration = parseInt(examDetails.duration);

    if (duration <= 0) {
      alert("Duration must be greater than 0");
      return;
    }

    if (start >= end) {
      alert("Start time must be before end time");
      return;
    }

    if (start < new Date()) {
      alert("Start time cannot be in the past");
      return;
    }

    const totalMinutes = (end - start) / (1000 * 60);
    if (duration > totalMinutes) {
      alert(`Exam duration (${duration} min) cannot exceed time between start and end (${Math.floor(totalMinutes)} min)`);
      return;
    }

    try {
      setLoading(true);
      
      // Get adminId from token
      const adminId = extractAdminIdFromToken();
      if (!adminId) {
        alert("Could not extract adminId from token. Please login again.");
        return;
      }
      
      console.log("Using adminId from token:", adminId);
      
      // Format dates for API - IMPORTANT: Use ISO format with T
      const examData = {
        title: examDetails.title,
        description: examDetails.description,
        duration: duration,
        startDate: formatDateForAPI(examDetails.startDate), // Will be "2026-01-01T10:00:00"
        endDate: formatDateForAPI(examDetails.endDate)      // Will be "2026-01-01T11:00:00"
      };

      console.log("📤 Creating exam with data:", examData);
      console.log("📤 Date format check:");
      console.log("  startDate:", examData.startDate, "(should have T, not space)");
      console.log("  endDate:", examData.endDate, "(should have T, not space)");
      
      // Make the API call
      const response = await createExam(adminId, examData);
      console.log("✅ Exam created successfully:", response.data);
      
      alert(`✅ Exam "${examDetails.title}" created successfully! Status: DRAFT\n\nExam ID: ${response.data.id}\n\nNext steps:\n1. Add questions\n2. Publish the exam\n3. Assign candidates`);
      
      onClose();
      
      // Refresh the page to show new exam
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error("❌ Error creating exam:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.status === 403) {
        alert(`🔒 Access denied (403). 
        
Please check:
1. Token is valid and not expired
2. You have admin permissions
3. Backend is running properly`);
        
      } else if (error.response?.data?.message) {
        alert(`❌ Failed to create exam: ${error.response.data.message}`);
      } else if (error.response?.status === 400) {
        alert(`❌ Bad request (400). Likely date format issue.\n\nBackend expects: "2026-01-01T10:00:00"\nCheck console for details.`);
      } else if (error.message) {
        alert(`❌ Network error: ${error.message}`);
      } else {
        alert("❌ Failed to create exam. Please check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getMinEndDate = () => {
    if (!examDetails.startDate) return "";
    const start = new Date(examDetails.startDate);
    start.setMinutes(start.getMinutes() + 1);
    return start.toISOString().slice(0, 16);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Create New Exam</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-info">
              <p><strong>Note:</strong> Dates should be in ISO format (YYYY-MM-DDTHH:MM:SS)</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="title">Exam Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={examDetails.title}
                onChange={handleChange}
                placeholder="Enter exam title"
                required
                minLength="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={examDetails.description}
                onChange={handleChange}
                placeholder="Enter exam description"
                rows="3"
                required
                minLength="10"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={examDetails.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
                <small className="hint">Will be sent as: {examDetails.startDate ? formatDateForAPI(examDetails.startDate) : "YYYY-MM-DDTHH:MM:SS"}</small>
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date & Time *</label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={examDetails.endDate}
                  onChange={handleChange}
                  min={getMinEndDate()}
                  required
                />
                <small className="hint">Will be sent as: {examDetails.endDate ? formatDateForAPI(examDetails.endDate) : "YYYY-MM-DDTHH:MM:SS"}</small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (minutes) *</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={examDetails.duration}
                onChange={handleChange}
                placeholder="e.g., 60"
                min="1"
                max="480"
                required
              />
              <small className="hint">Exam duration must fit between start and end time</small>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit" 
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Exam"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateExamModal;