import client from "./client";

export const listResults = async () => {
  const { data } = await client.get("/results/");
  return data;
};

export const createResult = async (payload) => {
  const { data } = await client.post("/results/", payload);
  return data;
};

export const publishResult = async (id) => {
  const { data } = await client.patch(`/results/${id}/publish/`);
  return data;
};

export const updateResult = async (id, payload) => {
  const { data } = await client.patch(`/results/${id}/`, payload);
  return data;
};

export const myResults = async () => {
  const { data } = await client.get("/results/me/");
  return data;
};

export const myGPA = async () => {
  const { data } = await client.get("/results/me/gpa/");
  return data;
};

export const downloadResults = async () => {
  const response = await client.get("/results/me/download/", { responseType: "blob" });
  return response.data;
};

export const downloadResultsPdf = async () => {
  const response = await client.get("/results/me/download/pdf/", { responseType: "blob" });
  return response.data;
};
