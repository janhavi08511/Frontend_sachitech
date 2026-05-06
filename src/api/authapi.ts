import API from "./axios";

export const loginApi = async (email: string, password: string) => {
  const res = await API.post("/auth/login", { email, password });
  return res.data;
};