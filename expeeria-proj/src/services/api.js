import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BACKEND || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});