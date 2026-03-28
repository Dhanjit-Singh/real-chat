import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import MessageInput from "./MessageInput";
import socket from "../../socket";
import api from "../../api/api";
import { FiArrowLeft, FiMoreVertical, FiPhone, FiVideo, FiInfo, FiCheck, FiCheckCircle, FiUser, FiCircle } from "react-icons/fi";
import UserProfile from "../pages/UserProfile";

const ChatWindow = ({ selectedChat, loggedInUser, selectedUser, onlineUsers, onBack }) => {
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const handleReceiveMessage = (msg) => {
            setMessages((prev) => {
                const exists = prev.some((m) => m._id === msg._id);
                if (exists) return prev;
                return [...prev, msg];
            });
            const senderId = msg.sender?._id || msg.sender;
        };

        socket.on("receiveMessage", handleReceiveMessage);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
        };

    }, []);

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }
    }, []);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatLastSeen = (date) => {
        if (!date) {
            return "";
        }

        const d = new Date(date);

        return d.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatMessageTime = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        if (!selectedChat) {
            return;
        }

        socket.emit("joinChat", selectedChat._id);
        setMessages([]);

        api.get(`/api/messages/${selectedChat._id}`)
            .then((res) => {
                setMessages(res.data);
            })
            .catch((err) => console.error(err));
    }, [selectedChat?._id]);

    const handleSendMessage = (text) => {
        if (!text.trim()) {
            return;
        }

        if (!socket.connected) {
            return;
        }

        socket.emit("sendMessage", {
            chatId: selectedChat._id,
            senderId: loggedInUser.id,
            text,
        });
    };

    const isOnline = onlineUsers?.includes(selectedUser?._id);

    if (!selectedChat) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <FiUser className="text-3xl text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg">Select a chat</p>
                <p className="text-gray-400 text-sm mt-1">Start a conversation</p>
            </div>
        );
    }

    if (!loggedInUser) {
        return null;
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 relative">

            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm pt-16">
                <div className="flex items-center justify-between px-4 py-3">

                    {/* Left Section */}
                    <div className="flex items-center gap-3">
                        {/* Back Button - Mobile */}
                        <button
                            onClick={onBack}
                            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        >
                            <FiArrowLeft className="text-xl text-gray-600" />
                        </button>

                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                {selectedUser?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            {isOnline && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                            )}
                        </div>

                        {/* User Info */}
                        <div>
                            <div className="font-semibold text-gray-800 text-lg">
                                {selectedUser?.name || ""}
                            </div>
                            <div className="text-xs flex items-center gap-1">
                                {isOnline ? (
                                    <>
                                        <FiCircle className="text-green-500 text-xs fill-green-500" />
                                        <span className="text-green-600 font-medium">Online</span>
                                    </>
                                ) : (
                                    <span className="text-gray-400">
                                        Last seen {formatLastSeen(selectedUser?.lastSeen)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center gap-2">
                        {/* <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                            <FiPhone className="text-gray-600 text-lg" />
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                            <FiVideo className="text-gray-600 text-lg" />
                        </button> */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                            >
                                <FiMoreVertical className="text-gray-600 text-lg" />
                            </button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
                                        <FiInfo className="text-gray-400" />
                                        <Link to="/user-profile" state={{ user: selectedUser }}> View Profile</Link>
                                    </button>
                                    <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
                                        <FiUser className="text-red-400" />
                                        Block User
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages?.length > 0 ? (
                    messages.map((msg, index) => {
                        const senderId = msg.sender?._id || msg.sender;
                        const isMe = senderId?.toString() === loggedInUser.id.toString();
                        const showAvatar = !isMe && (index === 0 ||
                            (messages[index - 1] && (messages[index - 1].sender?._id || messages[index - 1].sender) !== senderId));

                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`flex ${isMe ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[85%] md:max-w-[70%]`}>

                                    {/* Avatar for other user */}
                                    {!isMe && showAvatar && (
                                        <div className="flex-shrink-0 mb-1">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                {selectedUser?.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                        </div>
                                    )}

                                    {!isMe && !showAvatar && (
                                        <div className="w-8 flex-shrink-0"></div>
                                    )}

                                    {/* Message Bubble */}
                                    <div className="group relative">
                                        <div
                                            className={`
                                                px-4 py-2.5 rounded-2xl
                                                break-words whitespace-pre-wrap
                                                ${isMe
                                                    ? "bg-blue-600 text-white rounded-br-md"
                                                    : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"}
                                            `}
                                        >
                                            {msg?.text || ""}
                                        </div>

                                        {/* Message Status & Time */}
                                        <div className={`flex items-center gap-1 mt-1 text-xs ${isMe ? "justify-end" : "justify-start"}`}>
                                            <span className={`text-gray-400 ${isMe ? "mr-1" : "ml-1"}`}>
                                                {formatMessageTime(msg.createdAt)}
                                            </span>
                                            {isMe && (
                                                <span className="text-gray-400">
                                                    {msg.readBy?.length > 1 ?
                                                        <FiCheckCircle className="text-blue-500 text-xs" /> :
                                                        <FiCheck className="text-gray-400 text-xs" />
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <FiUser className="text-2xl text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-sm">No messages yet</p>
                        <p className="text-gray-400 text-xs mt-1">Start the conversation</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3">
                <MessageInput onSend={handleSendMessage} />
            </div>
        </div>
    );
};

export default ChatWindow;