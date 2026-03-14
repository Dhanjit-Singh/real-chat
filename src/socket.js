import { io } from "socket.io-client";

// const socket = io("http://localhost:5000");
// const socket = io("https://real-chat-backend-c3nm.onrender.com");
const socket = io("https://real-chat-backend-c3nm.onrender.com", {
    transports: ["websocket"]
});

export default socket;
