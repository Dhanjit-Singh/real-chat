import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import socket from "../../socket";
import { messaging, getToken, onMessage } from "../../firebase";
import api from "../../api/api";

const ChatLayout = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    const { user: loggedInUser } = useAuth();

    useEffect(() => {
        onMessage(messaging, (payload) => {
            console.log("Foreground message:", payload);

            new Notification(payload.notification.title, {
                body: payload.notification.body,
                icon: "/logo192.png"
            });
        });
    }, []);

    useEffect(() => {
        const getFCMToken = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") return;

                const registration = await navigator.serviceWorker.register(
                    "/firebase-messaging-sw.js"
                );

                const token = await getToken(messaging, {
                    vapidKey: process.env.REACT_APP_VAPID_KEY,
                    serviceWorkerRegistration: registration
                });

                if (token) {
                    console.log("FCM Token:", token);

                    // ✅ Correct Axios POST
                    await api.post("/api/notifications/save-token", {
                        userId: loggedInUser?.id,
                        token
                    });

                } else {
                    console.log("No registration token available");
                }
            } catch (err) {
                console.error("FCM error:", err);
            }
        };

        if (loggedInUser?.id) {
            getFCMToken();
        }
    }, [loggedInUser]);

    useEffect(() => {
        if (!loggedInUser?.id) return;

        socket.emit("userOnline", loggedInUser.id);

    }, [loggedInUser?.id]);

    useEffect(() => {
        socket.on("onlineUsers", (users) => {
            setOnlineUsers(users);
        });

        return () => socket.off("onlineUsers");
    }, []);

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
    };

    const handleSelectUser = (user) => {
        setSelectedUser(user);
    };

    useEffect(() => {
        if (!selectedChat) {
            return;
        }

        socket.emit("joinChat", selectedChat._id);
    }, [selectedChat]);

    const handleBack = () => {
        setSelectedChat(null);
        setSelectedUser(null);
    };


    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">

            <div
                className={`
                    w-full md:w-1/4 border-r bg-white pt-16
                    ${selectedChat ? "hidden md:block" : "block"}
                `}
            >
                <ChatList
                    selectedChat={selectedChat}
                    onSelectChat={handleSelectChat}
                    selectedUser={selectedUser}
                    onSelectUser={handleSelectUser}
                />
            </div>

            <div
                className={`
                    w-full md:w-3/4
                    ${!selectedChat ? "hidden md:block" : "block"}
                `}
            >
                <ChatWindow
                    selectedChat={selectedChat}
                    loggedInUser={loggedInUser}
                    selectedUser={selectedUser}
                    onlineUsers={onlineUsers}
                    onBack={handleBack}
                />
            </div>

        </div>
    );
};

export default ChatLayout;
