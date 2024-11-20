export const getAllCommunities = async (url) => {
  const response = await fetch(url);
  const communities = await response.json();
  return communities;
};
