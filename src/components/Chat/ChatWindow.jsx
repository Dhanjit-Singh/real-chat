import { useEffect, useState } from "react";
import MessageInput from "./MessageInput";
import socket from "../../socket";
import api from "../../api/api";

const ChatWindow = ({ selectedChat, loggedInUser, selectedUser, onlineUsers, onBack }) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const handleReceiveMessage = (msg) => {
            // setMessages((prev) => [...prev, msg]);
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

    const isOnline = onlineUsers.includes(selectedUser?._id);

    if (!selectedChat) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                Select a chat
            </div>
        );
    }

    if (!loggedInUser) {
        return null;
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* header */}
            <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-teal-800 text-white shadow-md pt-16">

                <button
                    onClick={onBack}
                    className="md:hidden flex items-center justify-center w-10 h-10 text-2xl font-bold"
                >
                    ←
                </button>

                <div>
                    <div className="font-semibold text-lg">
                        {selectedUser?.name || ""}
                    </div>

                    <div className="text-sm opacity-80">
                        {isOnline
                            ? "Online"
                            : `Last seen ${formatLastSeen(selectedUser?.lastSeen)}`}
                    </div>
                </div>

            </div>

            {/* message */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages?.length > 0 ? (
                    messages.map((msg) => {
                        const senderId = msg.sender?._id || msg.sender;
                        const isMe = senderId.toString() === loggedInUser.id.toString();

                        return (

                            <div
                                key={msg._id}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`
                                        max-w-[75%] md:max-w-[50%] px-3 py-2 rounded-lg
                                        break-words whitespace-pre-wrap
                                        ${isMe
                                            ? "bg-blue-600 text-white rounded-br-none"
                                            : "bg-gray-200 rounded-bl-none"}
                                    `}
                                >
                                    {msg?.text || ""}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex justify-center items-center h-full text-gray-400">
                        No messages yet
                    </div>
                )}
            </div>
            <div className="bg-white border-t p-2 flex-shrink-0">
                <MessageInput onSend={handleSendMessage} />
            </div>
        </div>
    );
};

export default ChatWindow;
