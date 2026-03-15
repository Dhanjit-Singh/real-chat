import { useEffect, useState } from "react";
import MessageInput from "./MessageInput";
import socket from "../../socket";

const ChatWindow = ({ selectedChat, loggedInUser, selectedUser, onlineUsers, onBack }) => {
    const [messages, setMessages] = useState([]);

    const formatLastSeen = (date) => {
        if (!date) return "";

        const d = new Date(date);

        return d.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    useEffect(() => {
        if (!selectedChat) return;

        socket.emit("joinChat", selectedChat._id);

        // fetch(`http://localhost:5000/api/messages/${selectedChat._id}`)
        fetch(`https://real-chat-backend-c3nm.onrender.com/api/messages/${selectedChat._id}`)
            .then((res) => res.json())
            .then((data) => setMessages(data));

        socket.on("receiveMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => socket.off("receiveMessage");
    }, [selectedChat]);

    const handleSendMessage = (text) => {
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
        return;
    }

    return (
        <div className="flex flex-col h-full">

            {/* Messages */}

            {/* <div className="flex-1 p-4 overflow-y-auto space-y-4 mt-12"> */}
            {/* <div className="flex-1 p-4 overflow-y-auto space-y-4 mt-12"> */}
            {/* <div className="w-full px-4 py-3 bg-teal-800 text-white font-semibold text-lg">
                    {selectedUser?.name || ""}

                    <div className="text-sm opacity-80">
                        {isOnline
                            ? "Online"
                            : `Last seen ${formatLastSeen(selectedUser?.lastSeen)}`}
                    </div>
                </div> */}

            {/* <div className="flex items-center gap-3 px-4 py-3 bg-teal-800 text-white"> */}
            <div className="flex items-center gap-3 px-4 py-3 bg-teal-800 text-white pt-16">

                <button
                    onClick={onBack}
                    className="md:hidden text-xl font-bold"
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

            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
                {messages?.length > 0 ? (
                    messages.map((msg) => {
                        const isMe =
                            msg.sender._id
                                ? msg.sender._id === loggedInUser.id
                                : msg.sender === loggedInUser.id;

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
            <div className="fixed bottom-0 left-0 right-0 md:static bg-white border-t p-2">
                <MessageInput onSend={handleSendMessage} />
            </div>
        </div>
    );
};

export default ChatWindow;
