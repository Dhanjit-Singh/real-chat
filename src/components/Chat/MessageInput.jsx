import { useState, useRef } from "react";
import { FiSend, FiSmile, FiPaperclip, FiMic } from "react-icons/fi";

const MessageInput = ({ onSend }) => {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const inputRef = useRef(null);

    const send = async () => {
        if (!text.trim() || sending) {
            return;
        }

        const message = text;
        setText("");
        inputRef.current?.focus();
        setSending(true);
        await onSend(message);
        setSending(false);
    };

    return (
        <div className="flex items-end gap-2 bg-white rounded-2xl border border-gray-200 p-2 shadow-sm hover:shadow-md transition-all duration-200">

            {/* Attachment Button */}
            <button
                className="flex-shrink-0 w-10 h-10 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center"
                onClick={() => {
                    // Add attachment functionality here
                }}
            >
                <FiPaperclip className="text-lg" />
            </button>

            {/* Emoji Button */}
            <button
                className="flex-shrink-0 w-10 h-10 rounded-full text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-all duration-200 flex items-center justify-center"
                onClick={() => {
                    // Add emoji picker functionality here
                }}
            >
                <FiSmile className="text-lg" />
            </button>

            {/* Input Field */}
            <div className="flex-1 relative">
                <textarea
                    ref={inputRef}
                    className="w-full bg-gray-50 rounded-xl outline-none px-3 py-2 text-sm resize-none focus:bg-white transition-all duration-200 border border-transparent focus:border-blue-200"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            send();
                        }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    style={{
                        minHeight: "40px",
                        maxHeight: "120px",
                        overflowY: "auto"
                    }}
                    onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                />
            </div>

            {/* Voice Message Button */}
            {!text.trim() ? (
                <button
                    className="flex-shrink-0 w-10 h-10 rounded-full text-gray-400 hover:text-purple-500 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center"
                    onClick={() => {
                        // Add voice recording functionality here
                    }}
                >
                    <FiMic className="text-lg" />
                </button>
            ) : (
                /* Send Button */
                <button
                    onClick={send}
                    disabled={!text.trim() || sending}
                    className={`
                        flex-shrink-0 w-10 h-10 rounded-full 
                        flex items-center justify-center
                        transition-all duration-200 transform
                        ${!text.trim() || sending
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-md active:scale-95"
                        }
                    `}
                >
                    {sending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <FiSend className="text-base" />
                    )}
                </button>
            )}
        </div>
    );
};

export default MessageInput;