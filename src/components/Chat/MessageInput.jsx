import { useState, useRef } from "react";
import { FiSend, FiSmile, FiPaperclip, FiMic, FiX, FiImage } from "react-icons/fi";
import api from "../../api/api";

const MessageInput = ({ onSend, onSendImage, chatId, senderId, isUploading: externalUploading }) => {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [imageCaption, setImageCaption] = useState("");
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

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

    const sendImage = () => {
        fileInputRef.current?.click();
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSendImage = async () => {
        if (!selectedImage) {
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedImage);
            formData.append('chatId', chatId);
            formData.append('senderId', senderId);

            const response = await api.post('/api/messages/send-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.status === true) {
                if (onSendImage) {
                    onSendImage(response.data.message);
                }
                clearImageSelection();
                setImageCaption(""); // Clear caption
            } else {
                console.log(response.data.message || 'Failed to send image');
            }

        } catch (error) {
            console.error('Error sending image:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const clearImageSelection = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploading = externalUploading || isUploading;


    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
            />

            {imagePreview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Preview Image</h3>
                            <button
                                onClick={clearImageSelection}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full max-h-64 object-contain rounded-lg"
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                {selectedImage?.name} ({(selectedImage?.size / 1024).toFixed(2)} KB)
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={clearImageSelection}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendImage}
                                disabled={isUploading}
                                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <FiImage />
                                        Send Image
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex items-end gap-2 bg-white rounded-2xl border border-gray-200 p-2 shadow-sm hover:shadow-md transition-all duration-200">

                {/* Attachment Button */}
                <button
                    className="flex-shrink-0 w-10 h-10 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center"
                    onClick={sendImage}
                    disabled={isUploading}
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
        </>
    );
};

export default MessageInput;