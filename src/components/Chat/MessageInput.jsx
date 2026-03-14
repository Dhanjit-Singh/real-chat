import { useState } from "react";

const MessageInput = ({ onSend }) => {
    const [text, setText] = useState("");

    const send = () => {
        if (!text.trim()) return;
        onSend(text);
        setText("");
    };

    return (
        <>
            {/* <div className="flex p-2 border-t bg-white">
                <input
                    className="flex-1 border rounded px-3"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                    placeholder="Type a message..."
                />
                <button
                    onClick={send}
                    className="ml-2 px-4 bg-blue-600 text-white rounded"
                >
                    Send
                </button>
            </div> */}

            <div className="p-3 border-t bg-white">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 shadow-sm">

                    <input
                        className="flex-1 bg-transparent outline-none px-2 text-sm"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && send()}
                        placeholder="Type a message..."
                    />

                    <button
                        onClick={send}
                        className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                        ➤
                    </button>

                </div>
            </div>
        </>
    );
};

export default MessageInput;
