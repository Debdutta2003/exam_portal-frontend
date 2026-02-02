import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { startExamSession } from "../../api/CandidateApi";
import "../../styles/SystemCheck.css";

function SystemCheck() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraGranted, setCameraGranted] = useState(false);
  const [screenGranted, setScreenGranted] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  // Request camera permission and start video
  const requestCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user" 
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
        
        videoRef.current.onerror = () => {
          setError("Camera failed to load.");
          setCameraReady(false);
        };
      }
      
      setCameraGranted(true);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera permission denied or camera not available.");
      setCameraGranted(false);
      setCameraReady(false);
    }
  };

  // Request screen share permission
  const requestScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true,
        audio: false 
      });
      
      // Handle when user stops sharing screen
      stream.getVideoTracks()[0].onended = () => {
        setScreenGranted(false);
      };
      
      setScreenGranted(true);
      setError("");
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        setError("Screen share permission denied.");
      }
    }
  };

  // Capture photo from webcam - FIXED VERSION
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) {
      console.error("Capture conditions not met:", {
        hasVideoRef: !!videoRef.current,
        hasCanvasRef: !!canvasRef.current,
        cameraReady,
        videoReady: videoRef.current?.readyState === 4
      });
      return null;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Ensure video is playing and has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error("Video has zero dimensions");
      return null;
    }
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    
    try {
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to Blob (JPEG format)
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log("Photo captured, size:", blob.size);
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob from canvas"));
            }
          },
          'image/jpeg',
          0.8
        );
      });
    } catch (err) {
      console.error("Error capturing photo:", err);
      return null;
    }
  };

  const canProceed = cameraGranted && screenGranted && consentGiven && cameraReady;

  const handleProceed = async () => {
  if (!canProceed) {
    setError("Please complete all checks before proceeding.");
    return;
  }
  
  try {
    setLoading(true);
    setError("");
    
    // Give video a moment to ensure it's ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Capture photo
    const photoBlob = await capturePhoto();
    
    if (!photoBlob) {
      throw new Error("Failed to capture photo. Please ensure camera is working.");
    }
    
    // Verify blob has data
    if (photoBlob.size === 0) {
      throw new Error("Captured photo is empty.");
    }
    
    console.log("Photo captured successfully, size:", photoBlob.size);
    
    // Create a File from the Blob
    const photoFile = new File([photoBlob], `exam-start-${id}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
    
    console.log("Calling start exam API with file:", photoFile.name, "size:", photoFile.size);
    
    // Call start exam API with the photo
    const response = await startExamSession(id, photoFile);
    console.log("Start exam API response:", response);
    
    // Get submission ID and questions from response
    const submissionId = response.data.submissionId || response.data.id;
    const questions = response.data.questions || [];
    
    if (!submissionId) {
      throw new Error("No submission ID received from server");
    }
    
    if (!questions || questions.length === 0) {
      throw new Error("No questions received from server");
    }
    
    console.log("Navigating to exam interface with:", {
      submissionId,
      questionCount: questions.length
    });
    
    // Navigate to exam interface with submission ID AND questions
    navigate(`/exam-interface/${id}/${submissionId}`, {
      state: {
        questions: questions,
        duration: response.data.duration || 60,
        submissionId: submissionId
      }
    });
    
  } catch (err) {
    console.error("Error starting exam:", err);
    setError(err.response?.data?.message || err.message || "Failed to start exam. Please try again.");
  } finally {
    setLoading(false);
  }
};
  // Cleanup video stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="system-check">
      <h1>System Check</h1>
      <p className="instructions">
        Please complete the following checks before starting your exam.
      </p>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          {error.includes("photo") && (
            <button onClick={requestCamera} style={{ marginLeft: '10px' }}>
              Retry Camera
            </button>
          )}
        </div>
      )}

      <div className="check-section">
        <h3>1. Camera Permission {cameraReady && "✅"}</h3>
        <div className="check-item">
          <button 
            onClick={requestCamera}
            className={cameraGranted ? "granted" : ""}
          >
            {cameraGranted ? "✅ Camera Granted" : "Grant Camera Permission"}
          </button>
          
          {cameraGranted && (
            <div className="camera-preview">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="camera-feed"
                style={{
                  border: cameraReady ? '3px solid #4CAF50' : '3px solid #ff9800'
                }}
              />
              <p className="preview-note">
                {cameraReady 
                  ? "✅ Camera ready - Photo will be captured when starting exam" 
                  : "⏳ Camera loading... Please wait"}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="check-section">
        <h3>2. Screen Share Permission</h3>
        <div className="check-item">
          <button 
            onClick={requestScreenShare}
            className={screenGranted ? "granted" : ""}
          >
            {screenGranted ? "✅ Screen Share Granted" : "Grant Screen Share Permission"}
          </button>
          <p className="helper-text">
            You'll be asked to share your entire screen or a specific window.
          </p>
        </div>
      </div>

      <div className="check-section">
        <h3>3. Exam Rules & Consent</h3>
        <div className="rules-list">
          <ul>
            <li>✅ Camera must remain ON throughout the exam</li>
            <li>✅ No switching tabs or applications</li>
            <li>✅ No other person should be in the room</li>
            <li>✅ No use of mobile phones or other devices</li>
            <li>✅ Screen must be shared continuously</li>
            <li>❌ More than 2 violations will auto-submit your exam</li>
          </ul>
        </div>
        
        <div className="check-item">
          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
            />
            <span>
              I have read and agree to all the exam rules listed above. I understand that 
              violations may result in exam termination.
            </span>
          </label>
        </div>
      </div>

      <div className="proceed-section">
        <div className="status-checks">
          <p>
            <span className={cameraGranted ? "check-pass" : "check-fail"}>
              {cameraGranted ? "✅" : "❌"} Camera
            </span>
            <span className={screenGranted ? "check-pass" : "check-fail"}>
              {screenGranted ? "✅" : "❌"} Screen Share
            </span>
            <span className={consentGiven ? "check-pass" : "check-fail"}>
              {consentGiven ? "✅" : "❌"} Consent
            </span>
            <span className={cameraReady ? "check-pass" : "check-fail"}>
              {cameraReady ? "✅" : "❌"} Camera Ready
            </span>
          </p>
        </div>
        
        <button
          className="proceed-btn"
          disabled={!canProceed || loading}
          onClick={handleProceed}
        >
          {loading ? "Starting Exam..." : "Start Exam"}
        </button>
        
        {canProceed && (
          <p className="proceed-note">
            Clicking "Start Exam" will capture a photo and begin your exam.
          </p>
        )}
        
        {!canProceed && (
          <p className="proceed-note">
            Complete all checks above to enable the Start Exam button.
          </p>
        )}
      </div>

      {/* Hidden canvas for capturing photos */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default SystemCheck;