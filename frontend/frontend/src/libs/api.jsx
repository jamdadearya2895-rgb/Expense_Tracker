import axios from "axios";

const API_URL = "http://localhost:5000/api-v1";

const api = axios.create({
  baseURL: API_URL,
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// OPTIONAL but helpful
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      setAuthToken(null);
    }
    return Promise.reject(err);6
  }
);

export default api;
