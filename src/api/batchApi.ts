import API from "./axios";

// ─── Admin Endpoints ───────────────────────────────────────────────────────

export const getBatches = async () => {
  const res = await API.get("/api/admin/batches");
  return res.data;
};

export const getBatchesByCourse = async (courseId: number) => {
  const res = await API.get(`/api/admin/batches/course/${courseId}`);
  return res.data;
};

export const getBatchesByInternship = async (internshipId: number) => {
  const res = await API.get(`/api/admin/batches/internship/${internshipId}`);
  return res.data;
};

export const createBatch = async (data: any, courseId?: number | string, trainerId?: number | string, internshipId?: number | string) => {
  let url = `/api/admin/add-batch?trainerId=${trainerId || ""}`;
  if (courseId) url += `&courseId=${courseId}`;
  if (internshipId) url += `&internshipId=${internshipId}`;
  const res = await API.post(url, data);
  return res.data;
};

export const deleteBatch = async (id: number | string) => {
  const res = await API.delete(`/api/admin/delete-batch/${id}`);
  return res.data;
};

// ─── Trainer Endpoints ─────────────────────────────────────────────────────

export const getTrainerBatches = async () => {
  const res = await API.get("/api/trainer/batches");
  return res.data;
};

export const getTrainerBatchesByCourse = async (courseId: number) => {
  const res = await API.get(`/api/trainer/batches/course/${courseId}`);
  return res.data;
};

export const getTrainerBatchesByInternship = async (internshipId: number) => {
  const res = await API.get(`/api/trainer/batches/internship/${internshipId}`);
  return res.data;
};