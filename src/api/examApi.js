import api from "./api";

export const createExam = (adminId, examData) =>
  api.post(`/admin/exams/create?adminId=${adminId}`, examData);

export const addQuestion = (examId, question) =>
  api.post(`/admin/exams/${examId}/questions`, question);

export const publishExam = (examId) =>
  api.post(`/admin/exams/${examId}/publish`);

export const inviteMultipleCandidates = (examId, payload) =>
  api.post(`/admin/exams/${examId}/candidate-multiple-invite`, payload);

// export const uploadExamCandidatesCSV = (examId, formData) =>
//   api.post(`/admin/exams/${examId}/direct-upload-exam-candidate`, formData,
//     {
//       headers: { "Content-Type": "multipart/form-data" },
//     }
//   );

export const uploadExamCandidatesCSV = (examId, file) => {
  const formData = new FormData();
  formData.append("file", file); // 🔥 key MUST be "file"

  return api.post(
    `/admin/exams/${examId}/candidates/upload`,
    formData
  );
};

export const uploadQuestionsCSV = (examId, file) => {
  console.log("uploadQuestionsCSV called with:", {
    examId,
    fileName: file?.name,
    fileSize: file?.size,
    fileType: file?.type
  });

  const formData = new FormData();
  formData.append("file", file); // Make sure this is the exact key
  
  // Log FormData contents for debugging
  for (let [key, value] of formData.entries()) {
    console.log(`FormData key: ${key}, value:`, value);
  }

  return api.post(
    `/admin/exams/${examId}/questions/upload`,
    formData,
    {
      headers: { 
        "Content-Type": "multipart/form-data",
      },
    }
  );
};


// src/api/examInviteApi.js
export const verifyExamInvite = async (token) => {
  const res = await api.get(
    `/api/exams/invite/verify?token=${token}`
  );
  return res.data;
};


// Add these functions to your examApi.js

export const getExams = () => 
  api.get("/admin/exams");

export const getExamSubmissions = (examId) =>
  api.get(`/admin/exams/${examId}/submissions`);



export const updateExamStatus = (examId, statusData) =>
  api.put(`/admin/exams/${examId}/status`, statusData);

// Note: The snapshot URL doesn't need an API function since it's a direct image URL
// But we can add a helper if needed
export const getSnapshotImage = (snapshotId) => {
  return api.get(`/admin/exams/snapshot/${snapshotId}`, {
    responseType: 'blob',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
};

