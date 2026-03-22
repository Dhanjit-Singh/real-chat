import { io } from "socket.io-client";

//======== for production ======
// const socket = io("https://real-chat-backend-c3nm.onrender.com");

const socket = io("https://real-chat-backend-c3nm.onrender.com", {
    withCredentials: true,
    transports: ["websocket", "polling"]
});
//========end ======

//======== for local =========
// const socket = io("http://localhost:5000", {
//     withCredentials: true,
//     transports: ["websocket"]
// });

//======== end =========

export default socket;
