import { useState } from "react";
import { FiCheck, FiCheckCircle, FiMoreVertical, FiCopy, FiTrash2, FiReply, FiStar } from "react-icons/fi";

const MessageBubble = ({ message, isMe, showAvatar, avatarInitial, avatarColor, onReply, onCopy, onDelete, onStar }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const formatTime = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text);
        onCopy?.();
        setShowMenu(false);
    };

    return (
        <div
            className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`flex ${isMe ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[85%] md:max-w-[70%]`}>

                {/* Avatar (only for other user's messages) */}
                {!isMe && showAvatar && (
                    <div className="flex-shrink-0 mb-1">
                        <div
                            className={`w-8 h-8 rounded-full ${avatarColor || "bg-gradient-to-r from-blue-500 to-purple-500"} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
                        >
                            {avatarInitial || "?"}
                        </div>
                    </div>
                )}

                {!isMe && !showAvatar && (
                    <div className="w-8 flex-shrink-0"></div>
                )}

                {/* Message Bubble */}
                <div className="relative group/bubble">
                    <div
                        className={`
                            px-4 py-2.5 rounded-2xl
                            break-words whitespace-pre-wrap
                            transition-all duration-200
                            ${isMe
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md shadow-md"
                                : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100 hover:shadow-md"
                            }
                        `}
                    >
                        {/* Message Text */}
                        <div className="text-sm leading-relaxed">
                            {message.text}
                        </div>

                        {/* Message Metadata */}
                        <div className={`flex items-center gap-1 mt-1 text-xs ${isMe ? "justify-end" : "justify-start"}`}>
                            <span className={`${isMe ? "text-blue-100" : "text-gray-400"}`}>
                                {formatTime(message.createdAt)}
                            </span>
                            {isMe && (
                                <span className="text-blue-100">
                                    {message.readBy?.length > 1 ?
                                        <FiCheckCircle className="text-blue-200 text-xs" /> :
                                        <FiCheck className="text-blue-200 text-xs" />
                                    }
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Message Actions Menu (on hover) */}
                    {(isHovered || showMenu) && (
                        <div className={`absolute ${isMe ? "-left-12" : "-right-12"} top-1/2 -translate-y-1/2`}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-1.5 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-200"
                            >
                                <FiMoreVertical className="text-gray-500 text-sm" />
                            </button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <div className="absolute top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 min-w-[140px]">
                                    <button
                                        onClick={handleCopy}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <FiCopy className="text-gray-400 text-xs" />
                                        Copy
                                    </button>
                                    <button
                                        onClick={() => {
                                            onReply?.();
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <FiReply className="text-gray-400 text-xs" />
                                        Reply
                                    </button>
                                    <button
                                        onClick={() => {
                                            onStar?.();
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <FiStar className="text-gray-400 text-xs" />
                                        Star
                                    </button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                        onClick={() => {
                                            onDelete?.();
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <FiTrash2 className="text-red-400 text-xs" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;