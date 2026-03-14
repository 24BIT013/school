import client from "./client";

export const registerUser = async (payload) => {
  const { data } = await client.post("/auth/register/", payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await client.post("/auth/login/", payload);
  return data;
};

export const getMe = async () => {
  const { data } = await client.get("/auth/me/");
  return data;
};

export const listStudents = async () => {
  const { data } = await client.get("/auth/students/");
  return data;
};

export const updateStudent = async (id, payload) => {
  const { data } = await client.patch(`/auth/students/${id}/`, payload);
  return data;
};

export const deleteStudent = async (id) => {
  const { data } = await client.delete(`/auth/students/${id}/`);
  return data;
};
