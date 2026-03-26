import { useState, useRef } from "react";

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
        <>
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 shadow-sm">

                <input
                    ref={inputRef}
                    className="flex-1 bg-transparent outline-none px-2 text-sm"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    // onKeyDown={(e) => e.key === "Enter" && send()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            send();
                        }
                    }}
                    placeholder="Type a message..."
                />

                <button
                    onClick={send}
                    disabled={!text.trim() || sending}
                    className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                    ➤
                </button>

            </div>
        </>
    );
};

export default MessageInput;
