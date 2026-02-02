// api/candidateApi.js - Updated
import api from "./api";

export const getStudentExams = () =>
  api.get("/api/student/exams");

export const startExamSession = (examId, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  
  return api.post(`/api/exams/session/${examId}/start`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const submitViolation = (submissionId) => {
  return api.post(`/api/exams/session/submissions/${submissionId}/violation`)
    .then(response => {
      // Return the updated violation count from backend
      return {
        ...response,
        violations: response.data?.violations || null
      };
    })
    .catch(error => {
      console.error("Violation API error:", error);
      throw error;
    });
};

export const submitExamAnswers = (submissionId, answers) => {
  // Ensure answers are properly formatted
  const formattedAnswers = {};
  Object.entries(answers).forEach(([key, value]) => {
    formattedAnswers[String(key)] = String(value);
  });
  
  console.log("Submitting formatted answers:", formattedAnswers);
  
  return api.post(`/api/exams/session/submissions/${submissionId}/submit`, formattedAnswers, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Add periodic save function
export const saveProgress = (submissionId, answers) => {
  const formattedAnswers = {};
  Object.entries(answers).forEach(([key, value]) => {
    formattedAnswers[String(key)] = String(value);
  });
  
  return api.post(`/api/exams/session/submissions/${submissionId}/save`, {
    answers: formattedAnswers,
    timestamp: new Date().toISOString()
  });
};