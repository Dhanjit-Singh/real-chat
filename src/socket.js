import { io } from "socket.io-client";

//======== for production ======
// const socket = io("https://real-chat-backend-c3nm.onrender.com");

const socket = io("https://real-chat-backend-c3nm.onrender.com", {
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    transports: ["websocket", "polling"]
});
//========end ======

//======== for local =========
// const socket = io("http://localhost:5000", {
//     withCredentials: true,
//     autoConnect: true,
//     reconnection: true,
//     // transports: ["websocket"]
// });

//======== end =========

export default socket;
