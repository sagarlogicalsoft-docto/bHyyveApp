const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const BACKEND_URL = new URL(API_BASE_URL).origin;

export const getImage = (imageName) => {
  if (!imageName) {
    return "";
  }

  if (/^https?:\/\//i.test(imageName)) {
    return imageName;
  }

  const filename = String(imageName).replace(/^\/?(uploads|assets\/images)\//, "");

  return `${BACKEND_URL}/assets/images/${encodeURIComponent(filename)}`;
};