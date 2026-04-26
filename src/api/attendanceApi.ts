import API from "./axios";

// ─── Course students (for marking screen) ────────────────────────────────────
export const getCourseStudents = async (courseId: number) => {
  const res = await API.get(`/api/attendance/course/${courseId}/students`);
  return res.data;
};

// ─── Concurrency lock ─────────────────────────────────────────────────────────
export const lockCourse = async (courseId: number) => {
  const res = await API.post(`/api/attendance/lock/${courseId}`);
  return res.data;
};

export const unlockCourse = async (courseId: number) => {
  const res = await API.post(`/api/attendance/unlock/${courseId}`);
  return res.data;
};

// ─── Bulk mark attendance ─────────────────────────────────────────────────────
export const markBulkAttendance = async (courseId: number, date: string, records: { studentId: number; status: string }[]) => {
  const res = await API.post("/api/attendance/mark", { courseId, date, records });
  return res.data;
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const getStudentReport = async (studentId: number) => {
  const res = await API.get(`/api/attendance/report/student/${studentId}`);
  return res.data;
};

export const getCourseSummaryReport = async (courseId: number) => {
  const res = await API.get(`/api/attendance/report/summary?courseId=${courseId}`);
  return res.data;
};

export const getAttendanceForDate = async (courseId: number, date: string) => {
  const res = await API.get(`/api/attendance/course/${courseId}/date/${date}`);
  return res.data;
};

// ─── Courses (role-aware) ────────────────────────────────────────────────────
export const getAllCourses = async (role?: string) => {
  const endpoint = role === "trainer" ? "/api/lms/trainer/courses" : "/api/admin/courses";
  const res = await API.get(endpoint);
  return Array.isArray(res.data) ? res.data : [];
};

// ─── Legacy (kept for backward compat) ───────────────────────────────────────
export const markAttendance = (data: any) => API.post("/api/attendance/mark", data);
export const getStudentAttendance = (studentId: number) => API.get(`/api/attendance/student/${studentId}`);
export const getAllBatches = async (role?: string) => getAllCourses(role);
export const getAllStudents = async (role?: string) => {
  const endpoint = role === "trainer" ? "/api/trainer/students" : "/api/admin/studentdata/all";
  const res = await API.get(endpoint);
  return Array.isArray(res.data) ? res.data : [];
};
