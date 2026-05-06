import API from "./axios";

export const getAllAssignments = async () => {
  const res = await API.get("/api/trainer/assignments");
  return res.data;
};

export const gradeAssignment = async (id: number, score: number, status: string) => {
  const res = await API.put(`/api/trainer/grade-assignment/${id}`, {
    score,
    evaluationStatus: status
  });
  return res.data;
};

// ─── Trainer Profile Management ────────────────────────────────────────────

export const updateTrainerProfile = async (trainerProfileId: number, data: {
  phone?: string;
  specialization?: string;
  courseIds?: number[];
  internshipIds?: number[];
}) => {
  const res = await API.put(`/api/admin/update-trainer-profile/${trainerProfileId}`, data);
  return res.data;
};

export const getTrainerProfile = async (trainerProfileId: number) => {
  const res = await API.get(`/api/admin/trainer-profile/${trainerProfileId}`);
  return res.data;
};
