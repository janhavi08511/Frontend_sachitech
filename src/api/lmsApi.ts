import API from "./axios";

const BASE = "/api/lms";

// ─── Content (Admin / Trainer) ────────────────────────────────────────────────

/** Upload a PDF assignment or note */
export const uploadLmsContent = (formData: FormData) =>
  API.post<LmsContent>(`${BASE}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/** Get all content for a course */
export const getContentByCourse = (courseId: number) =>
  API.get<LmsContent[]>(`${BASE}/content/${courseId}`);

/** Get all content for an internship */
export const getContentByInternship = (internshipId: number) =>
  API.get<LmsContent[]>(`${BASE}/internship-content/${internshipId}`);

// ─── Student ──────────────────────────────────────────────────────────────────

/** Student: fetch all content across enrolled courses + internships */
export const getMyContent = () =>
  API.get<LmsContent[]>(`${BASE}/my-content`);

/** Student: submit a PDF for an assignment */
export const submitAssignment = (assignmentId: number, file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("assignmentId", String(assignmentId));
  return API.post<LmsSubmission>(`${BASE}/submit`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/** Student: get own submissions */
export const getMySubmissions = () =>
  API.get<LmsSubmission[]>(`${BASE}/my-submissions`);

// ─── Trainer / Admin ──────────────────────────────────────────────────────────

/** Get all submissions (trainer/admin) */
export const getAllSubmissions = () =>
  API.get<LmsSubmission[]>(`${BASE}/submissions`);

/** Get submissions for a specific assignment */
export const getSubmissionsForAssignment = (assignmentId: number) =>
  API.get<LmsSubmission[]>(`${BASE}/submissions/assignment/${assignmentId}`);

/** Evaluate a submission */
export const evaluateSubmission = (submissionId: number, score: number, feedback: string) =>
  API.put<LmsSubmission>(`${BASE}/evaluate/${submissionId}`, { score, feedback });

// ─── Courses (reused from admin) ──────────────────────────────────────────────
export const getCourses = () => API.get("/api/admin/courses");
export const getInternships = () => API.get("/api/admin/internships");

// ─── Trainer-specific endpoints ───────────────────────────────────────────────
export const getTrainerCourses = () => API.get<any[]>(`${BASE}/trainer/courses`);
export const getTrainerInternships = () => API.get<any[]>(`${BASE}/trainer/internships`);
export const getTrainerSubmissions = () => API.get<LmsSubmission[]>(`${BASE}/trainer/submissions`);

// ─── Types (flat DTO structure — matches backend Map responses) ───────────────

export interface LmsContent {
  id: number;
  title: string;
  type: "ASSIGNMENT" | "NOTE";
  fileUrl: string;
  uploadDate: string;
  courseId?: number;
  courseName?: string;
  internshipId?: number;
  internshipName?: string;
  uploadedById?: number;
  uploadedByName?: string;
}

export interface LmsSubmission {
  id: number;
  fileUrl: string;
  submissionDate: string;
  status: "PENDING" | "SUBMITTED" | "EVALUATED";
  score?: number;
  feedback?: string;
  assignmentId?: number;
  assignmentTitle?: string;
  assignmentType?: string;
  courseName?: string;
  studentId?: number;
  studentName?: string;
  studentEmail?: string;
}
