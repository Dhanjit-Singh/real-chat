import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import socket from "../../socket";
import { FiSearch, FiMessageSquare, FiMoreVertical, FiCheck, FiCheckCircle } from "react-icons/fi";

const ChatList = ({ onSelectChat, selectedChat, onSelectUser, selectedUser }) => {
    const { user: loggedInUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Function to get avatar color based on name
    const getAvatarColor = (name) => {
        const colors = [
            "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
            "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
            "bg-orange-500", "bg-cyan-500", "bg-emerald-500", "bg-violet-500"
        ];
        const index = name?.charAt(0).toUpperCase().charCodeAt(0) || 0;
        return colors[index % colors.length];
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get(`/api/chats?userId=${loggedInUser.id}`);
            const sortedChats = res.data.sort(
                (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
            setUsers(sortedChats);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        if (loggedInUser?.id) {
            fetchUsers();
            socket.emit("userOnline", loggedInUser.id);
        }
    }, [loggedInUser]);

    useEffect(() => {
        const handleUnreadUpdate = ({ senderId }) => {
            setUsers(prev =>
                prev.map(chat => {
                    const isSenderInChat = chat.users.some(
                        u => u._id === senderId
                    );

                    return isSenderInChat
                        ? {
                            ...chat,
                            unreadCount: (chat.unreadCount || 0) + 1
                        }
                        : chat;
                }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            );
        };

        socket.on("unread_update", handleUnreadUpdate);

        return () => {
            socket.off("unread_update", handleUnreadUpdate);
        };
        
    }, []);

    const handleChatClick = async (chat, user) => {
        if (!chat || !user || !loggedInUser) {
            return;
        }

        onSelectUser(user);
        
        onSelectChat({
            ...chat,
            _id: chat._id + ""
        });

        setUsers(prev =>
            prev.map(c =>
                c._id === chat._id
                    ? { ...c, unreadCount: 0 }
                    : c
            )
        );

        try {
            await api.post("/api/chats/reset-unread", {
                senderId: user._id,
                userId: loggedInUser.id
            });
        } catch (err) {
            console.error(err);
        }
    };

    // Helper function to get last message text
    const getLastMessageText = (chat) => {
        if (!chat.lastMessage) return "No messages yet";
        
        // If lastMessage is an object, extract the text property
        if (typeof chat.lastMessage === 'object') {
            return chat.lastMessage.text || "Media message";
        }
        
        // If it's a string, return it directly
        return chat.lastMessage;
    };

    // Helper function to format time
    const formatTime = (date) => {
        if (!date) return "";
        const messageDate = new Date(date);
        const now = new Date();
        const diffHours = (now - messageDate) / (1000 * 60 * 60);
        
        if (diffHours < 24) {
            return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffHours < 48) {
            return "Yesterday";
        } else {
            return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const filteredUsers = users.filter(chat => {
        const otherUser = chat.users.find(u => u._id !== loggedInUser?.id);
        return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="h-full flex flex-col bg-white mt-4">
            
            {/* Header with Search */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-gray-800">Messages</h2>
                    <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        {users.length} chats
                    </div>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {filteredUsers?.length > 0 && loggedInUser?.id ? (
                    filteredUsers.map((chat) => {
                        const otherUser = chat.users.find(
                            u => u._id !== loggedInUser.id
                        );

                        if (!otherUser) return null;

                        const hasUnread = chat.unreadCount > 0;
                        const lastMessageText = getLastMessageText(chat);
                        const lastMessageTime = chat.updatedAt || chat.lastMessage?.createdAt;
                        const firstLetter = otherUser.name?.charAt(0).toUpperCase() || "?";

                        return (
                            <div
                                key={chat._id}
                                onClick={() => handleChatClick(chat, otherUser)}
                                className={`
                                    group relative flex items-center gap-3
                                    px-4 py-3 cursor-pointer transition-all duration-200
                                    hover:bg-gray-50 active:bg-gray-100
                                    ${selectedUser?._id === otherUser._id
                                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                                        : "border-l-4 border-l-transparent"
                                    }
                                `}
                            >
                                {/* Avatar with Unread Badge */}
                                <div className="relative flex-shrink-0">
                                    {otherUser.avatar ? (
                                        <img
                                            src={otherUser.avatar}
                                            alt={otherUser.name}
                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                                        />
                                    ) : (
                                        <div className={`
                                            w-12 h-12 rounded-full 
                                            flex items-center justify-center 
                                            ring-2 ring-white shadow-sm
                                            ${getAvatarColor(otherUser.name)}
                                        `}>
                                            <span className="text-white text-lg font-bold">
                                                {firstLetter}
                                            </span>
                                        </div>
                                    )}

                                    {/* Unread Badge */}
                                    {hasUnread && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full shadow-sm">
                                            {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                                        </span>
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`
                                            font-semibold truncate
                                            ${hasUnread ? "text-gray-900" : "text-gray-700"}
                                        `}>
                                            {otherUser.name}
                                        </h3>
                                        {lastMessageTime && (
                                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                                {formatTime(lastMessageTime)}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-1">
                                        {/* Message Status Icon */}
                                        {chat.lastMessage && chat.lastMessage.sender === loggedInUser.id && (
                                            <span className="text-gray-400 text-xs">
                                                {chat.lastMessage.readBy?.length > 1 ? 
                                                    <FiCheckCircle className="text-blue-500 text-xs" /> : 
                                                    <FiCheck className="text-gray-400 text-xs" />
                                                }
                                            </span>
                                        )}
                                        
                                        <p className={`
                                            text-sm truncate flex-1
                                            ${hasUnread ? "text-gray-900 font-medium" : "text-gray-500"}
                                        `}>
                                            {lastMessageText}
                                        </p>
                                    </div>
                                </div>

                                {/* Quick Action Button */}
                                <button 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-200 rounded-lg flex-shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Add menu options here if needed
                                    }}
                                >
                                    <FiMoreVertical className="text-gray-400 text-sm" />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <FiMessageSquare className="text-3xl text-gray-400" />
                        </div>
                        <h3 className="text-gray-600 font-medium mb-1">
                            {searchTerm ? "No conversations found" : "No messages yet"}
                        </h3>
                        <p className="text-gray-400 text-sm text-center">
                            {searchTerm 
                                ? "Try a different search term" 
                                : "Start a conversation by adding a friend"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList;