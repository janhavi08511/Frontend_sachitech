import API from "./axios";

export const getCourses = async () => {
  const res = await API.get("/api/admin/courses");
  return res.data;
};

export const createCourse = async (data: any) => {
  const res = await API.post("/api/admin/add-course", data);
  return res.data;
};

export const deleteCourse = async (id: number | string) => {
  const res = await API.delete(`/api/admin/delete-course/${id}`);
  return res.data;
};