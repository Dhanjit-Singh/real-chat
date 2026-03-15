import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import socket from "../../socket";

const ChatLayout = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    const { user: loggedInUser } = useAuth();

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

    useEffect(() => {
        if ("Notification" in window) {
            Notification.requestPermission();
        }
    }, []);

    const handleBack = () => {
        setSelectedChat(null);
        setSelectedUser(null);
    };


    return (
        <div className="flex h-full bg-gray-100">

            {/* Sidebar */}
            {/* <div className="hidden md:block md:w-1/4 border-r bg-white pt-16">
                <ChatList
                    selectedChat={selectedChat}
                    onSelectChat={handleSelectChat}
                    selectedUser={selectedUser}
                    onSelectUser={handleSelectUser}
                />
            </div> */}

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

            {/* Chat Window */}
            {/* <div className="w-full md:w-3/4">
                <ChatWindow
                    selectedChat={selectedChat}
                    loggedInUser={loggedInUser}
                    selectedUser={selectedUser}
                    onlineUsers={onlineUsers}
                />
            </div> */}

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
