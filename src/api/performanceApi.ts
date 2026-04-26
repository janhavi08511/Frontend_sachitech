import API from "./axios";

// ================= PERFORMANCE =================

export const getPerformance = (studentId: number, courseId: number) =>
  API.get(`/api/performance/student/${studentId}/course/${courseId}`);

export const getSkills = (studentId: number) =>
  API.get(`/api/performance/student/${studentId}/skills`);

export const updatePerformance = (studentId: number, courseId: number, data: any) =>
  API.put(`/api/performance/student/${studentId}/course/${courseId}`, data);


// ================= FIX (VERY IMPORTANT) =================

// ✅ GET ALL STUDENTS (reuse existing backend)
export const getAllStudents = async () => {
  const res = await API.get("/api/admin/studentdata/all");
  return res.data;
};

// ✅ GET COURSES
export const getCourses = async () => {
  const res = await API.get("/api/admin/courses");
  return res.data;
};
// ✅ LEADERBOARD
export const getLeaderboard = async (courseId: number) => {
  const res = await API.get(`/api/performance/course/${courseId}/leaderboard`);
  return res.data;
};

// ✅ AI INSIGHT
export const getAIInsight = async (studentId: number, courseId: number) => {
  const res = await API.get(`/api/performance/student/${studentId}/course/${courseId}/insight`);
  return res.data;
};

/**
 * GET /api/performance/student/{id}/all-courses
 * Returns full breakdown per enrolled course:
 * { courseId, courseName, attendancePercentage, averageScore,
 *   totalAssignments, submitted, assignments[], insight }
 */
export const getAllCoursesPerformance = async (studentId: number) => {
  const res = await API.get(`/api/performance/student/${studentId}/all-courses`);
  return res.data as AllCoursePerformance[];
};

export interface AssignmentDetail {
  id: number;
  title: string;
  maxScore: number;
  score: number | null;
  percentage: number | null;
  evaluationStatus: string;
  submissionLink: string | null;
}

export interface AllCoursePerformance {
  courseId: number;
  courseName: string;
  attendancePercentage: number;
  totalClasses: number;
  classesAttended: number;
  averageScore: number;
  totalAssignments: number;
  submitted: number;
  assignments: AssignmentDetail[];
  insight: string;
}