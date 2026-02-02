import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { 
  submitViolation, 
  submitExamAnswers,
  
} from "../../api/CandidateApi";
import "../../styles/CandidateExamInterface.css";

function CandidateExamInterface() {
  const { id, submissionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get questions from navigation state
  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(location.state?.duration * 60 || 60 * 60);
  const [warnings, setWarnings] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(!location.state?.questions);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  
  const MAX_WARNINGS = 2;
  const violationTimerRef = useRef(null);
  const screenStreamRef = useRef(null);
  const checkpointTimerRef = useRef(null);
  const violationReportedRef = useRef(false); // Prevent duplicate violation reporting
  const violationCooldownRef = useRef(false); // Cooldown between violations

  /* ---------- Fullscreen Enforcement ---------- */
  const enterFullscreen = async () => {
    try {
      const elem = document.documentElement;
      
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { /* Safari */
        await elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE11 */
        await elem.msRequestFullscreen();
      }
      
      setIsFullscreen(true);
      console.log("Entered fullscreen");
    } catch (err) {
      console.error("Fullscreen error:", err);
      reportViolation("Failed to enter fullscreen mode");
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  /* ---------- Fullscreen Change Detection ---------- */
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement || 
                                document.webkitFullscreenElement || 
                                document.msFullscreenElement;
      
      setIsFullscreen(!!fullscreenElement);
      
      if (!fullscreenElement && !submitted) {
        reportViolation("Exited fullscreen mode");
      }
    };
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, [submitted]);

  /* ---------- Tab Visibility Detection ---------- */
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabVisible(isVisible);
      
      if (!isVisible && !submitted && !violationReportedRef.current) {
        reportViolation("Tab switched or minimized");
      }
    };
    
    const handleBlur = () => {
      if (!submitted && document.hasFocus() === false && !violationReportedRef.current) {
        reportViolation("Window lost focus");
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [submitted]);

  /* ---------- Prevent Context Menu and Keyboard Shortcuts ---------- */
  useEffect(() => {
    const preventDefault = (e) => {
      // Prevent right-click context menu
      if (e.type === "contextmenu") {
        e.preventDefault();
        reportViolation("Right-click attempted");
      }
      
      // Prevent common exit shortcuts (F11, Esc)
      if (e.type === "keydown") {
        if (e.key === "F11" || (e.key === "Escape" && isFullscreen)) {
          e.preventDefault();
          reportViolation(`Attempted to use ${e.key} key`);
        }
        
        // Prevent common browser shortcuts (Ctrl+W, Ctrl+T, Ctrl+Tab, etc.)
        if (e.ctrlKey || e.metaKey) {
          switch(e.key) {
            case 'w': // Ctrl+W (close tab)
            case 't': // Ctrl+T (new tab)
            case 'n': // Ctrl+N (new window)
            case 'tab': // Ctrl+Tab (switch tab)
              e.preventDefault();
              reportViolation(`Attempted shortcut ${e.ctrlKey ? 'Ctrl+' : 'Cmd+'}${e.key}`);
              break;
          }
        }
      }
    };
    
    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("keydown", preventDefault);
    
    return () => {
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("keydown", preventDefault);
    };
  }, [isFullscreen, submitted]);

  /* ---------- Report Violation to Backend ---------- */
  const reportViolation = async (reason) => {
    // Prevent duplicate reporting during cooldown
    if (violationCooldownRef.current || violationReportedRef.current || submitted) {
      return;
    }
    
    try {
      violationCooldownRef.current = true;
      violationReportedRef.current = true;
      
      console.log(`Reporting violation: ${reason}`);
      
      // Report to backend
      const response = await submitViolation(submissionId);
      const updatedViolations = response.data?.violations || warnings + 1;
      
      // Update warnings from backend response
      setWarnings(updatedViolations);
      
      // Show alert to user
      alert(`⚠️ VIOLATION: ${reason}\n\nWarnings: ${updatedViolations}/${MAX_WARNINGS}\n${MAX_WARNINGS - updatedViolations} warning(s) remaining before auto-submit.`);
      
      // Check if max warnings reached
      if (updatedViolations > MAX_WARNINGS) {
        await handleAutoSubmit("Maximum violations reached. Exam auto-submitted.");
      }
      
    } catch (err) {
      console.error("Error reporting violation:", err);
      // Still increment warning locally if backend fails
      const updatedWarnings = warnings + 1;
      setWarnings(updatedWarnings);
      
      if (updatedWarnings > MAX_WARNINGS) {
        await handleAutoSubmit("Maximum violations reached. Exam auto-submitted.");
      }
    } finally {
      // Reset cooldown after 1 second
      setTimeout(() => {
        violationCooldownRef.current = false;
        violationReportedRef.current = false;
      }, 1000);
    }
  };

  /* ---------- Auto Submit on Max Warnings ---------- */
  const handleAutoSubmit = async (message) => {
    if (submitted) return;
    
    try {
      setSubmitted(true);
      alert(message);
      
      // Format answers for backend
      const formattedAnswers = {};
      Object.keys(answers).forEach(questionId => {
        formattedAnswers[questionId] = answers[questionId];
      });
      
      console.log("Auto-submitting due to violations:", formattedAnswers);
      
      // Use auto-submit endpoint if available, otherwise regular submit
      await submitExamAnswers(submissionId, formattedAnswers);
      
      // Navigate to submission page
      navigate("/exam-submitted", { 
        state: { 
          autoSubmitted: true,
          reason: "Maximum violations reached",
          warnings: warnings
        } 
      });
      
    } catch (err) {
      console.error("Error in auto-submit:", err);
      // Try regular submit as fallback
      try {
        await submitExamAnswers(submissionId, formattedAnswers || {});
        navigate("/exam-submitted", { 
          state: { 
            autoSubmitted: true,
            reason: "Maximum violations reached",
            warnings: warnings
          } 
        });
      } catch (submitErr) {
        setError("Failed to auto-submit exam. Please contact administrator.");
      }
    }
  };

  /* ---------- Periodic Checkpoint (Save time) ---------- */
  useEffect(() => {
    const saveCheckpoint = async () => {
      try {
        // Send current time left to backend every 30 seconds
        await api.post(`/api/exams/session/submissions/${submissionId}/checkpoint`, {
          timeLeft: timeLeft,
          answers: answers
        });
        console.log("Checkpoint saved:", timeLeft);
      } catch (err) {
        console.error("Error saving checkpoint:", err);
      }
    };
    
    // Save checkpoint every 30 seconds
    checkpointTimerRef.current = setInterval(saveCheckpoint, 30000);
    
    return () => {
      if (checkpointTimerRef.current) {
        clearInterval(checkpointTimerRef.current);
      }
    };
  }, [submissionId, timeLeft, answers]);

  /* ---------- Timer with Auto-Submit ---------- */
  useEffect(() => {
    if (submitted || timeLeft <= 0 || questions.length === 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, submitted, questions.length]);

  const handleTimeExpired = async () => {
    if (submitted) return;
    
    try {
      setSubmitted(true);
      
      // Format answers for backend
      const formattedAnswers = {};
      Object.keys(answers).forEach(questionId => {
        formattedAnswers[questionId] = answers[questionId];
      });
      
      console.log("Time expired, auto-submitting:", formattedAnswers);
      
      // Submit answers
      await submitExamAnswers(submissionId, formattedAnswers);
      
      navigate("/exam-submitted", { 
        state: { 
          autoSubmitted: true,
          reason: "Time expired",
          timeLeft: 0
        } 
      });
      
    } catch (err) {
      console.error("Error on time expiration:", err);
      setError("Failed to auto-submit on time expiration.");
    }
  };

  /* ---------- Initialize Exam ---------- */
  useEffect(() => {
    const initializeExam = async () => {
      try {
        // Enter fullscreen
        await enterFullscreen();
        
        // Start periodic violation checks
        violationTimerRef.current = setInterval(() => {
          // Check if still in fullscreen
          const fullscreenElement = document.fullscreenElement || 
                                    document.webkitFullscreenElement || 
                                    document.msFullscreenElement;
          
          if (!fullscreenElement && !submitted) {
            reportViolation("Periodic check: Not in fullscreen mode");
          }
          
          // Check if screen sharing is still active (if implemented)
          if (screenStreamRef.current && 
              screenStreamRef.current.getVideoTracks().length === 0) {
            reportViolation("Screen sharing stopped");
          }
        }, 30000); // Check every 30 seconds
        
      } catch (err) {
        console.error("Error initializing exam:", err);
        setError("Failed to initialize exam monitoring.");
      }
    };
    
    if (questions.length > 0 && !submitted) {
      initializeExam();
    }
    
    return () => {
      if (violationTimerRef.current) {
        clearInterval(violationTimerRef.current);
      }
      if (checkpointTimerRef.current) {
        clearInterval(checkpointTimerRef.current);
      }
      // Exit fullscreen on unmount
      exitFullscreen();
    };
  }, [questions.length, submitted]);

  /* ---------- Answer Handling ---------- */
  const handleOptionSelect = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option
    });
  };

  /* ---------- Manual Submit ---------- */
  const handleSubmit = async () => {
    if (submitted) return;
    
    try {
      setSubmitted(true);
      
      // Format answers for backend
      const formattedAnswers = {};
      Object.keys(answers).forEach(questionId => {
        formattedAnswers[questionId] = answers[questionId];
      });
      
      console.log("Manually submitting answers:", formattedAnswers);
      
      // Submit to backend
      await submitExamAnswers(submissionId, formattedAnswers);
      
      alert("Exam submitted successfully!");
      navigate("/candidate-dashboard");
      
    } catch (err) {
      console.error("Error submitting exam:", err);
      setError("Failed to submit exam. Please try again.");
      setSubmitted(false);
    }
  };

  const formatTime = () => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /* ---------- Navigation ---------- */
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  /* ---------- Render ---------- */
  if (loading) {
    return (
      <div className="loading-screen">
        <h2>Initializing Exam...</h2>
        <p>Please wait while we set up the exam environment.</p>
        <p>Fullscreen mode will be activated automatically.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/candidate-dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="exam-submitted">
        <h1>Exam Submitted</h1>
        <p>Your exam has been submitted.</p>
        <button onClick={() => navigate("/candidate-dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="no-questions">
        <h2>No Questions Available</h2>
        <p>There are no questions for this exam.</p>
        <button onClick={() => navigate("/candidate-dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="exam-interface">
      {/* Fullscreen Warning */}
      {!isFullscreen && (
        <div className="fullscreen-warning">
          ⚠️ WARNING: You are not in fullscreen mode! Return to fullscreen immediately.
        </div>
      )}
      
      {/* Tab Visibility Warning */}
      {!isTabVisible && (
        <div className="visibility-warning">
          ⚠️ WARNING: Tab is not visible! Return to exam tab immediately.
        </div>
      )}

      {/* Sidebar - Question Navigation */}
      <aside className="question-sidebar">
        <h3>Questions</h3>
        <div className="question-numbers">
          {questions.map((q, index) => (
            <div
              key={q.id || index}
              className={`question-number ${
                index === currentIndex ? "active" : ""
              } ${answers[q.id] ? "answered" : ""}`}
              onClick={() => setCurrentIndex(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>
        
        <div className="sidebar-stats">
          <div className="stat">
            <span className="stat-label">Answered:</span>
            <span className="stat-value">
              {Object.keys(answers).length}/{questions.length}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Remaining:</span>
            <span className="stat-value">
              {questions.length - Object.keys(answers).length}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Question Area */}
      <main className="question-area">
        <div className="question-header">
          <h2>
            Question {currentIndex + 1} of {questions.length}
          </h2>
          <div className="question-meta">
            <span className="question-id">ID: {currentQuestion.id}</span>
            {currentQuestion.marks && (
              <span className="question-marks">Marks: {currentQuestion.marks}</span>
            )}
          </div>
        </div>
        
        <div className="question-text">
          <p>{currentQuestion.text || currentQuestion.question}</p>
        </div>

        <div className="options">
          {currentQuestion.options && Object.entries(currentQuestion.options).map(([key, value]) => (
            <label key={key} className={`option ${
              answers[currentQuestion.id] === key ? "selected" : ""
            }`}>
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={key}
                checked={answers[currentQuestion.id] === key}
                onChange={() => handleOptionSelect(currentQuestion.id, key)}
              />
              <span className="option-label">{key}:</span>
              <span className="option-text">{value}</span>
            </label>
          ))}
        </div>

        <div className="navigation-buttons">
          <button
            className="nav-btn prev-btn"
            disabled={currentIndex === 0}
            onClick={goToPrevious}
          >
            ← Previous
          </button>

          <button
            className="nav-btn next-btn"
            disabled={currentIndex === questions.length - 1}
            onClick={goToNext}
          >
            Next →
          </button>

          <button 
            className="submit-btn"
            onClick={handleSubmit}
          >
            Submit Exam
          </button>
        </div>
      </main>

      {/* Timer + Warning Panel */}
      <div className="control-panel">
        <div className="timer-container">
          <h3>Time Remaining</h3>
          <div className="timer-display">{formatTime()}</div>
          <p className="timer-note">Timer cannot be paused</p>
        </div>
        
        <div className="warning-container">
          <h3>Violation Warnings</h3>
          <div className="warning-display">
            <span className={`warning-count ${warnings >= MAX_WARNINGS ? "critical" : ""}`}>
              {warnings} / {MAX_WARNINGS}
            </span>
            <div className="warning-bar">
              <div 
                className="warning-fill"
                style={{ width: `${(warnings / MAX_WARNINGS) * 100}%` }}
              />
            </div>
          </div>
          <p className="warning-note">
            {warnings >= MAX_WARNINGS 
              ? "⚠️ MAXIMUM WARNINGS - Next violation auto-submits!"
              : warnings > 0
              ? `⚠️ ${MAX_WARNINGS - warnings} warning(s) remaining`
              : "No violations yet"}
          </p>
          
          <div className="status-indicators">
            <div className={`status-indicator ${isFullscreen ? "good" : "bad"}`}>
              {isFullscreen ? "✅ Fullscreen" : "❌ Not Fullscreen"}
            </div>
            <div className={`status-indicator ${isTabVisible ? "good" : "bad"}`}>
              {isTabVisible ? "✅ Tab Visible" : "❌ Tab Hidden"}
            </div>
          </div>
        </div>
        
        <div className="exam-info">
          <h3>Exam Info</h3>
          <p><strong>Exam ID:</strong> {id}</p>
          <p><strong>Submission ID:</strong> {submissionId?.substring(0, 8)}...</p>
          <p><strong>Total Questions:</strong> {questions.length}</p>
        </div>
      </div>
    </div>
  );
}

export default CandidateExamInterface;