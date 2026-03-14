import client from "./client";

export const listCourses = async () => {
  const { data } = await client.get("/courses/");
  return data;
};

export const addCourse = async (payload) => {
  const { data } = await client.post("/courses/", payload);
  return data;
};

export const updateCourse = async (id, payload) => {
  const { data } = await client.patch(`/courses/${id}/`, payload);
  return data;
};

export const deleteCourse = async (id) => {
  const { data } = await client.delete(`/courses/${id}/`);
  return data;
};

export const registerCourse = async (payload) => {
  const { data } = await client.post("/courses/registrations/", payload);
  return data;
};

export const myRegistrations = async () => {
  const { data } = await client.get("/courses/registrations/me/");
  return data;
};

export const pendingRegistrations = async () => {
  const { data } = await client.get("/courses/registrations/pending/");
  return data;
};

export const approveRegistration = async (id) => {
  const { data } = await client.patch(`/courses/registrations/${id}/approve/`);
  return data;
};

export const dropRegistration = async (id) => {
  const { data } = await client.patch(`/courses/registrations/${id}/drop/`);
  return data;
};
