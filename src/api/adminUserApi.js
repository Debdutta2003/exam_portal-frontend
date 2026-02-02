import api from "./api";

export const inviteUser = (data) =>
  api.post("/admin/users/invite", data);

export const uploadUsersCSV = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/admin/users/upload-csv", formData);
};

export const bulkInvite = (expiryInHours) =>
  api.post(`/admin/users/invite-bulk?expiryInHours=${expiryInHours}`);