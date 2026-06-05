import axios from "axios";

const API = axios.create({
  baseURL: "https://prompts-backend.onrender.com/",
});

export default API;
