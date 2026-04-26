import API from "./axios";

<<<<<<< HEAD

export const createFullUser = async (data: any) => {
  return await API.post("/api/admin/user/create-full", data);
};

=======
export const createUser = async (data: any) => {
  return await API.post("/api/admin/create-user", data);
};

export const createStudentProfile = async (data: any) => {
  return await API.post("/api/admin/create-student-profile", data);
};

export const createTrainerProfile = async (data: any) => {
  return await API.post("/api/admin/create-trainer-profile", data);
};
>>>>>>> f70c04d14eab9694cb26a8dd781eb875cee3f263

export const addCourse = async (data: any) => {
  return await API.post("/api/admin/add-course", data);
};

export const addInternship = async (data: any) => {
  return await API.post("/api/admin/add-internship", data);
};

export const getUsers = async () => {
  const res = await API.get("/api/admin/users");
  return res.data;
};

export const deleteUser = (id: number) =>
  API.delete(`/api/admin/users/${id}`);

export const updateUser = async (id: number, data: any) => {
  return await API.put(`/api/admin/users/${id}`, data);
};

export const updateStatus = async (id: number, status: string) => {
  return await API.patch(`/api/admin/users/${id}/status?status=${status}`);
};

export const getTrainers = async () => {
  const res = await API.get("/api/admin/users");
  return res.data.filter((u: any) => u.role === "TRAINER");
};

export const resetPassword = async (id: number, newPassword: string) => {
  return await API.patch(`/api/admin/users/${id}/reset-password`, { newPassword });
};

<<<<<<< HEAD



=======
export const enrollStudentWithInitialPayment = async (data: any) => {
  return await API.post("/api/admin/student/enroll-with-payment", data);
};

export const recordTrainerPayment = async (data: any) => {
  return await API.post("/api/admin/trainer/record-payment", data);
};
>>>>>>> f70c04d14eab9694cb26a8dd781eb875cee3f263

