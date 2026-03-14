import axios from "axios";

const api = axios.create({
    // baseURL: "http://localhost:5000",
    baseURL: "https://real-chat-backend-c3nm.onrender.com",
});

export default api;
