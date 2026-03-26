import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import avatarImg from "../../assets/images/avatar-img.jpg";
import socket from "../../socket";
import { toast, Toaster } from "react-hot-toast";


const ChatList = ({ onSelectChat, selectedChat, onSelectUser, selectedUser }) => {
    const { user: loggedInUser } = useAuth();
    const [users, setUsers] = useState([]);

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

    return (
        <div className="h-full flex flex-col">

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto pt-16">
                {users?.length > 0 && loggedInUser?.id &&
                    users.map((chat) => {

                        const otherUser = chat.users.find(
                            u => u._id !== loggedInUser.id
                        );

                        if (!otherUser) return null;

                        return (
                            <div
                                key={chat._id}
                                onClick={() => handleChatClick(chat, otherUser)}
                                className={`
                                flex items-center gap-3
                                px-4 py-3 cursor-pointer border-b
                                hover:bg-gray-100
                                ${selectedUser?._id === otherUser._id
                                        ? "bg-sky-200 font-medium"
                                        : ""
                                    }
                            `}
                            >

                                {/* Avatar + Notification */}
                                <div className="relative">
                                    <img
                                        src={avatarImg}
                                        alt="profile"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />

                                    {/* Badge (only show if unread > 0) */}
                                    {chat.unreadCount > 0 && (
                                        <span className="
                                        absolute -top-1 -right-1
                                        bg-red-500 text-white text-xs
                                        min-w-[18px] h-[18px] px-1
                                        flex items-center justify-center
                                        rounded-full border-2 border-white
                                    ">
                                            {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                                        </span>
                                    )}
                                </div>

                                {/* User Name */}
                                <div>
                                    {otherUser.name}
                                </div>

                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
};

export default ChatList;
