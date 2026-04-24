import API from "./axios";

export const getManagerDashboard = async () => {
  const res = await API.get("/api/manager/dashboard");
  return res.data;
};

export const getStudentDashboard = async (id: number) => {
  const res = await API.get(`/api/students/${id}/dashboard`);
  return res.data;
};

export const getTrainerDashboard = async () => {
  const res = await API.get("/api/trainer/dashboard");
  return res.data;  // already unwrapped — returns { totalStudents, totalCourses, totalInternships }
};