import API from './axios';

// ─── Internships (uses /api/admin/internships) ────────────────────────────

export const getInternships = async () => {
  const res = await API.get("/api/admin/internships");
  return res.data;
};

export const getAllInternships = async () => {
  const res = await API.get("/api/admin/internships");
  return res.data;
};

export const createInternship = async (data: any) => {
  const res = await API.post("/api/admin/add-internship", data);
  return res.data;
};

export const deleteInternship = async (id: number | string) => {
  const res = await API.delete(`/api/admin/delete-internship/${id}`);
  return res.data;
};

// ─── Placements (stub — no backend yet) ──────────────────────────────────

export const getPlacements = async () => [];
export const getAllPlacements = async () => [];
export const createPlacement = async (_data: any) => null;

// ─── Stats stubs (computed from data, no separate endpoints) ─────────────

export const getOngoingInternshipsCount = async () => ({ count: 0 });
export const getPlacedStudentsCount = async () => ({ count: 0 });
export const getAveragePackage = async () => ({ averagePackage: 0 });
