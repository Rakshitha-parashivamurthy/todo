export const API_URL = (import.meta as any).env?.VITE_API_URL || (
  window.location.hostname === "localhost" 
    ? "http://localhost:5000/api" 
    : "https://todo-backend.up.railway.app/api" // Replace with your actual deployed backend URL!
);
