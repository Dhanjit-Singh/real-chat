import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import avatarImg from "../../assets/images/avatar-img.jpg";

const ChatList = ({ onSelectChat, selectedChat, onSelectUser, selectedUser }) => {
    const { user: loggedInUser } = useAuth();
    console.log("loggedInUser===>>>>", loggedInUser);

    const [users, setUsers] = useState([]);

    // const loggedInUserId = "69900aa8cd2c52707754241d";

    const fetchUsers = async () => {
        try {
            // const res = await api.get("/api/users");
            const res = await api.get(
                `/api/users?userId=${loggedInUser.id}`
            );
            // console.log("users res==>>", res.data);
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);


    const handleUserClick = async (user) => {
        console.log("user====>>>", user);
        console.log("selectedChat====>>>", selectedChat);
        if (!user || !loggedInUser) {
            return;
        }

        onSelectUser(user);
        setUsers(prev =>
            prev.map(u =>
                u._id === user._id
                    ? { ...u, unreadCount: 0 }
                    : u
            )
        );

        try {
            const res = await api.post("/api/chats", {
                userId1: loggedInUser.id,
                userId2: user._id,
            });

            onSelectChat(res.data);

            await api.post("/api/chats/reset-unread", {
                senderId: user._id,
                userId: loggedInUser.id
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex items-center gap-3 px-4 py-4 cursor-pointer border-b">

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {users?.length > 0 && loggedInUser?.id &&
                    users
                        .filter(user => user._id !== loggedInUser.id)
                        .map((user) => (
                            <div
                                key={user._id}
                                onClick={() => handleUserClick(user)}
                                className={`
                                    flex items-center gap-3
                                    px-4 py-3 cursor-pointer border-b
                                    hover:bg-gray-100
                                    ${selectedUser?._id === user._id
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
                                    {user.unreadCount > 0 && (
                                        <span className="
                                            absolute -top-1 -right-1
                                            bg-red-500 text-white text-xs
                                            min-w-[18px] h-[18px] px-1
                                            flex items-center justify-center
                                            rounded-full border-2 border-white
                                        ">
                                            {user.unreadCount > 99 ? "99+" : user.unreadCount}
                                        </span>
                                    )}
                                </div>

                                {/* User Name */}
                                <div>
                                    {user.name}
                                </div>

                            </div>
                        ))
                }
            </div>
        </div>
    );
};

export default ChatList;
