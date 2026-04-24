import API from "./axios";

const BASE = "/api/lms";

// ✅ UPDATED: Support both local and deployed backends
// For local development: http://localhost:8080
// For production: https://backend-sachitech.onrender.com
const BACKEND_BASE = (() => {
  // Check if we're in development mode
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return "http://localhost:8080";
  }
  // Use environment variable if available
  if (typeof process !== 'undefined' && process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  // Default to deployed backend
  return "https://backend-sachitech.onrender.com";
})();

// ─── Content (Admin / Trainer) ────────────────────────────────────────────────

/** Upload a PDF assignment or note */
export const uploadLmsContent = (formData: FormData) =>
  API.post<LmsContent>(`${BASE}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/** Get all content for a course (admin/trainer: all; student: enrolled only) */
export const getContentByCourse = (courseId: number) =>
  API.get<LmsContent[]>(`${BASE}/content/${courseId}`);

/** Get all content for an internship (admin/trainer only) */
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

// ─── File URL helper ──────────────────────────────────────────────────────────

/** Returns the authenticated URL to stream/view a PDF */
export const getLmsFileUrl = (filename: string) =>
  `${BACKEND_BASE}${BASE}/file/${filename}`;

// ─── Courses (reused from admin) ──────────────────────────────────────────────
export const getCourses = () => API.get("/api/admin/courses");
export const getInternships = () => API.get("/api/admin/internships");

// ─── Trainer-specific endpoints ───────────────────────────────────────────────
export const getTrainerCourses = () => API.get<any[]>(`${BASE}/trainer/courses`);
export const getTrainerInternships = () => API.get<any[]>(`${BASE}/trainer/internships`);
export const getTrainerSubmissions = () => API.get<LmsSubmission[]>(`${BASE}/trainer/submissions`);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LmsContent {
  id: number;
  title: string;
  type: "ASSIGNMENT" | "NOTE";
  fileUrl: string;
  uploadDate: string;
  course?: { id: number; name: string };
  internship?: { id: number; name: string };
  uploadedBy?: { id: number; name: string; email: string };
}

export interface LmsSubmission {
  id: number;
  assignment: LmsContent;
  student: {
    id: number;
    user: { id: number; name: string; email: string };
  };
  fileUrl: string;
  submissionDate: string;
  status: "PENDING" | "SUBMITTED" | "EVALUATED";
  score?: number;
  feedback?: string;
}
