import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import socket from "../../socket";
import { messaging, getToken, onMessage } from "../../firebase";
import api from "../../api/api";
import { FiMessageSquare, FiUsers, FiSettings } from "react-icons/fi";

const ChatLayout = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [showMobileList, setShowMobileList] = useState(true);

    const { user: loggedInUser } = useAuth();

    useEffect(() => {
        onMessage(messaging, (payload) => {
            new Notification(payload.notification.title, {
                body: payload.notification.body,
                icon: "/logo192.png"
            });
        });
    }, []);

    useEffect(() => {
        if (!loggedInUser?.id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        socket.emit("userOnline", loggedInUser.id);
        setIsLoading(false);

    }, [loggedInUser?.id]);

    useEffect(() => {
        socket.on("onlineUsers", (users) => {
            setOnlineUsers(users);
        });

        return () => socket.off("onlineUsers");
    }, []);

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        setShowMobileList(false);
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
        setShowMobileList(true);
    };

    // Loading Spinner with Modern Design
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="relative">
                    <div className="h-16 w-16 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-4 text-gray-500 text-sm font-medium">Loading chats...</p>
            </div>
        );
    }

    return (
        <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">

            {/* Mobile Header (when chat is selected) */}
            {selectedChat && (
                <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 px-4 py-3 z-20 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBack}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>
                        <div>
                            <h3 className="font-semibold text-gray-800">{selectedUser?.name || "Chat"}</h3>
                            <p className="text-xs text-green-500">Online</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex h-full overflow-hidden">

                {/* Chat List Sidebar */}
                <div
                    className={`
                        transition-all duration-300 ease-in-out
                        ${!selectedChat || showMobileList
                            ? "w-full md:w-1/3 lg:w-1/4 translate-x-0"
                            : "w-0 -translate-x-full md:w-1/3 lg:w-1/4 md:translate-x-0"
                        }
                        bg-white border-r border-gray-200 h-full overflow-hidden
                        absolute md:relative z-10 md:z-auto
                        shadow-lg md:shadow-none
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
                <div
                    className={`
                        flex-1 h-full overflow-hidden transition-all duration-300
                        ${selectedChat && !showMobileList ? "block" : "hidden md:block"}
                    `}
                >
                    {selectedChat ? (
                        <ChatWindow
                            selectedChat={selectedChat}
                            loggedInUser={loggedInUser}
                            selectedUser={selectedUser}
                            onlineUsers={onlineUsers}
                            onBack={handleBack}
                        />
                    ) : (
                        /* Empty State - No Chat Selected */
                        <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-white">
                            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                <FiMessageSquare className="text-4xl text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Welcome to Real Chat
                            </h3>
                            <p className="text-gray-500 text-center max-w-md px-4">
                                Select a conversation from the list to start messaging
                            </p>

                            {/* Quick Stats */}
                            <div className="mt-8 flex gap-6">
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <FiUsers className="text-blue-500" />
                                    </div>
                                    <p className="text-xs text-gray-500">Active Chats</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    </div>
                                    <p className="text-xs text-gray-500">Online Friends</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <FiSettings className="text-purple-500" />
                                    </div>
                                    <p className="text-xs text-gray-500">Settings</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatLayout;