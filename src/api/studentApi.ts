import API from "./axios";


// ✅ GET



// ✅ MAIN FUNCTION
export const getAllStudents = async () => {
  const res = await API.get("/api/admin/studentdata/all");
  return res.data;
};

// ✅ ALIAS (🔥 FIX YOUR ERROR HERE)
export const getStudents = getAllStudents;

// ================= OTHER =================

export const getStudentInfo = (userId: number) =>
  API.get(`/api/admin/studentdata/info/${userId}`);

export const addStudentInfo = (id: number, data: any) =>
  API.post(`/api/admin/studentdata/add-info/${id}`, data);