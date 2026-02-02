import api from "./api";

export const login = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};

export const changePasswordFirstLogin = async (token, newPassword) => {
  const res = await api.post(
    `/auth/first-login/change-password?token=${token}`,
    { newPassword }
  );
  return res.data;
};