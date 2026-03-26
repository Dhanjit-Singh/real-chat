import { useState } from "react";

const MessageInput = ({ onSend }) => {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    // const send = () => {
    //     if (!text.trim()) return;
    //     onSend(text);
    //     setText("");
    // };

    const send = async () => {
        if (!text.trim() || sending) {
            return;
        }
        setSending(true);
        await onSend(text);
        setText("");
        setSending(false);
    };

    return (
        <>
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-3">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-3 shadow-sm">

                    <input
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
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                        ➤
                    </button>

                </div>
            </div>
        </>
    );
};

export default MessageInput;
