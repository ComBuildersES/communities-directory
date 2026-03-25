export const getAllCommunities = async (url, init = {}) => {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error("Error al obtener los datos");
  }
  return response.json();
};
