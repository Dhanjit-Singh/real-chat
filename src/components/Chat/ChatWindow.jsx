import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import MessageInput from "./MessageInput";
import socket from "../../socket";
import api from "../../api/api";
import {
    FiArrowLeft,
    FiMoreVertical,
    FiPhone,
    FiVideo,
    FiInfo,
    FiCheck,
    FiCheckCircle,
    FiUser,
    FiCircle,
    FiImage,
    FiMic,
    FiMicOff,
    FiVideoOff,
    FiPhoneOff
} from "react-icons/fi";
import Peer from "peerjs";

const ChatWindow = ({ selectedChat, loggedInUser, selectedUser, onlineUsers, onBack }) => {
    const [messages, setMessages] = useState([]);
    const [showMenu, setShowMenu] = useState(false);
    const [sendingImage, setSendingImage] = useState(false);
    const [isCallActive, setIsCallActive] = useState(false);

    const [callStarted, setCallStarted] = useState(false);
    const [callType, setCallType] = useState(null);
    const [incomingCall, setIncomingCall] = useState(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [peerReady, setPeerReady] = useState(false);
    const [remoteStreamActive, setRemoteStreamActive] = useState(false);

    const messagesEndRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerRef = useRef(null);
    const localStreamRef = useRef(null);
    const currentCallRef = useRef(null);
    const isRemoteStreamSetRef = useRef(false);
    const isAcceptingCall = useRef(false);
    const isCleaningUpRef = useRef(false);

    // Helper function to properly stop all media tracks
    const stopAllMediaTracks = async (stream) => {
        if (!stream) return;

        console.log("Stopping all media tracks...");
        const tracks = stream.getTracks();
        for (const track of tracks) {
            track.stop();
            track.enabled = false;
        }

        // Clear the stream reference
        if (stream === localStreamRef.current) {
            localStreamRef.current = null;
        }

        return new Promise(resolve => setTimeout(resolve, 500)); // Give time for device release
    };

    // Helper function to cleanup local stream completely
    const cleanupLocalStream = async () => {
        if (isCleaningUpRef.current) {
            console.log("Already cleaning up, skipping...");
            return;
        }

        isCleaningUpRef.current = true;

        try {
            if (localStreamRef.current) {
                await stopAllMediaTracks(localStreamRef.current);
            }

            // Clear video elements
            if (localVideoRef.current) {
                if (localVideoRef.current.srcObject) {
                    localVideoRef.current.srcObject.getTracks?.().forEach(track => track.stop());
                    localVideoRef.current.srcObject = null;
                }
                localVideoRef.current.load(); // Reset the video element
            }

            if (remoteVideoRef.current) {
                if (remoteVideoRef.current.srcObject) {
                    remoteVideoRef.current.srcObject.getTracks?.().forEach(track => track.stop());
                    remoteVideoRef.current.srcObject = null;
                }
                remoteVideoRef.current.load();
            }

            // Additional delay to ensure device release
            await new Promise(resolve => setTimeout(resolve, 300));
        } finally {
            isCleaningUpRef.current = false;
        }
    };

    // Initialize PeerJS
    useEffect(() => {
        if (!loggedInUser?.id) return;

        if (peerRef.current && !peerRef.current.destroyed) {
            console.log("Peer already exists, skipping initialization");
            return;
        }

        console.log("Initializing PeerJS for user:", loggedInUser.id);

        const peer = new Peer(loggedInUser.id, {
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    {
                        urls: 'turn:openrelay.metered.ca:80',
                        username: 'openrelayproject',
                        credential: 'openrelayproject'
                    }
                ]
            }
        });

        peer.on('open', (id) => {
            console.log('PeerJS connected with ID:', id);
            setPeerReady(true);
        });

        peer.on('call', (call) => {
            console.log('📞 Incoming call from:', call.peer);
            currentCallRef.current = call;
            setIncomingCall({
                from: call.peer,
                fromName: selectedUser?.name || 'User',
                callType: 'video'
            });
        });

        peer.on('error', (err) => {
            console.error('PeerJS error:', err);
            if (err.type === 'peer-unavailable') {
                alert('The user you are trying to call is not available.');
                endCall(true);
            }
        });

        peerRef.current = peer;

        return () => {
            if (peerRef.current && !peerRef.current.destroyed) {
                console.log("Cleaning up PeerJS on unmount");
                peerRef.current.destroy();
            }
        };
    }, [loggedInUser?.id]);

    // Socket event listeners
    useEffect(() => {
        const handleReceiveMessage = (msg) => {
            setMessages((prev) => {
                const exists = prev.some((m) => m._id === msg._id);
                if (exists) return prev;
                return [...prev, msg];
            });
        };

        const handleReceiveImage = (imageMsg) => {
            setMessages((prev) => {
                const exists = prev.some((m) => m._id === imageMsg._id);
                if (exists) return prev;
                return [...prev, imageMsg];
            });
        };

        const handleCallAccepted = ({ from }) => {
            console.log("✅ Call accepted by user:", from);
        };

        const handleCallRejected = () => {
            console.log("📡 call-rejected event received");
            alert("Call rejected");
            endCall(true);
        };

        const handleCallEnded = () => {
            console.log("📡 call-ended event received");
            alert("Call ended by other user");
            endCall(true);
        };

        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("receiveImage", handleReceiveImage);
        socket.on("call-accepted", handleCallAccepted);
        socket.on("call-rejected", handleCallRejected);
        socket.on("call-ended", handleCallEnded);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("receiveImage", handleReceiveImage);
            socket.off("call-accepted", handleCallAccepted);
            socket.off("call-rejected", handleCallRejected);
            socket.off("call-ended", handleCallEnded);
        };
    }, []);

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatLastSeen = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatMessageTime = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        if (!selectedChat) return;

        socket.emit("joinChat", selectedChat._id);
        setMessages([]);

        api.get(`/api/messages/${selectedChat._id}`)
            .then((res) => {
                setMessages(res.data);
            })
            .catch((err) => console.error(err));
    }, [selectedChat?._id]);

    const handleSendMessage = (text) => {
        if (!text.trim()) return;
        if (!socket.connected) return;

        socket.emit("sendMessage", {
            chatId: selectedChat._id,
            senderId: loggedInUser.id,
            text,
        });
    };

    const handleSendImage = (message) => {
        setMessages(prev => [...prev, message]);

        if (socket && socket.connected) {
            socket.emit("sendImage", {
                chatId: selectedChat._id,
                senderId: loggedInUser.id,
                imageUrl: message.imageUrl,
                imageName: message.imageName,
                imageSize: message.imageSize,
                messageId: message._id
            });
        }
    };

    // Function to safely set video source
    const setVideoSource = (videoElement, stream, isLocal = false) => {
        if (!videoElement) return;

        if (!isLocal) {
            isRemoteStreamSetRef.current = false;
        }

        videoElement.srcObject = stream;

        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log(`Video play interrupted for ${isLocal ? 'local' : 'remote'} video:`, error.name);
                setTimeout(() => {
                    if (videoElement && videoElement.srcObject === stream) {
                        videoElement.play().catch(e => console.log("Retry play failed:", e.name));
                    }
                }, 100);
            });
        }
    };

    // Start a call
    const startCall = async (type) => {
        setIsCallActive(true);
        console.log("startCall called with type:", type);

        if (isConnecting) {
            console.log("Already connecting, skipping...");
            return;
        }

        if (!peerRef.current || !peerReady) {
            console.error("PeerJS not initialized or not ready");
            alert("Call system is initializing. Please wait a moment and try again.");
            return;
        }

        setIsConnecting(true);
        isRemoteStreamSetRef.current = false;

        try {
            // CRITICAL: Clean up any existing stream first
            await cleanupLocalStream();

            // Additional delay for device release
            await new Promise(resolve => setTimeout(resolve, 500));

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Your browser does not support audio/video calls");
            }

            const constraints = {
                video: type === 'video',
                audio: true
            };

            console.log("Requesting media devices...");
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log("✅ Permission granted!");
            console.log("Video tracks:", stream.getVideoTracks().length);
            console.log("Audio tracks:", stream.getAudioTracks().length);

            localStreamRef.current = stream;

            if (localVideoRef.current && type === 'video') {
                setVideoSource(localVideoRef.current, stream, true);
            }

            console.log("Making call to:", selectedUser._id);
            const call = peerRef.current.call(selectedUser._id, stream);
            currentCallRef.current = call;

            call.on('stream', (remoteStream) => {
                if (isRemoteStreamSetRef.current) {
                    console.log("⚠️ Stream already handled, skipping...");
                    return;
                }

                isRemoteStreamSetRef.current = true;
                console.log("✅ Received remote stream from callee!");

                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.muted = false;
                    remoteVideoRef.current.volume = 1;

                    remoteVideoRef.current.onloadedmetadata = () => {
                        remoteVideoRef.current.play().catch(e =>
                            console.error("Remote video play error:", e)
                        );
                    };

                    setRemoteStreamActive(true);
                }
            });

            call.on('close', () => {
                console.log("Call closed (remote or peer)");
                currentCallRef.current = null;
                setCallStarted(false);
                setCallType(null);
                setRemoteStreamActive(false);
                cleanupLocalStream();
            });

            call.on('error', (err) => {
                console.error('Call error:', err);
                alert('Call connection failed: ' + err.message);
                endCall(true);
            });

            setCallStarted(true);
            setCallType(type);

            socket.emit("initiate-call", {
                to: selectedUser._id,
                from: loggedInUser.id,
                fromName: loggedInUser.name,
                chatId: selectedChat._id,
                callType: type
            });

        } catch (error) {
            console.error("❌ Error in startCall:", error);
            if (error.name === "NotAllowedError") {
                alert("Camera/Microphone access denied. Please click 'Allow' when prompted.");
            } else if (error.name === "NotFoundError") {
                alert("No camera or microphone found on your device.");
            } else if (error.name === "NotReadableError" || error.message.includes("in use")) {
                alert("Camera/Microphone is in use by another application. Please close other apps and try again.");
            } else {
                alert(`Unable to access camera/microphone: ${error.message}`);
            }
            await cleanupLocalStream();
            endCall(true);
        } finally {
            setIsConnecting(false);
        }
    };

    // Accept incoming call
    const acceptCall = async () => {
        console.log("Accepting call...");

        if (isAcceptingCall.current) {
            console.log("Already accepting call, skipping...");
            return;
        }

        if (!currentCallRef.current) {
            console.error("No call to accept");
            return;
        }

        isAcceptingCall.current = true;
        setIsConnecting(true);
        isRemoteStreamSetRef.current = false;

        try {
            // CRITICAL: Clean up any existing stream first
            await cleanupLocalStream();

            // Additional delay for device release
            await new Promise(resolve => setTimeout(resolve, 500));

            const constraints = {
                video: incomingCall.callType === 'video',
                audio: true
            };

            console.log("Requesting camera/microphone access...");
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log("✅ Got media stream");
            console.log("Video tracks:", stream.getVideoTracks().length);
            console.log("Audio tracks:", stream.getAudioTracks().length);

            localStreamRef.current = stream;

            if (localVideoRef.current) {
                setVideoSource(localVideoRef.current, stream, true);
            }

            console.log("Answering the call...");
            currentCallRef.current.answer(stream);
            console.log("Call answered");

            currentCallRef.current.on('stream', (remoteStream) => {
                if (isRemoteStreamSetRef.current) {
                    console.log("⚠️ Stream already handled, skipping...");
                    return;
                }

                isRemoteStreamSetRef.current = true;
                console.log("✅ Got remote stream from caller!");

                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.muted = false;
                    remoteVideoRef.current.volume = 1;

                    remoteVideoRef.current.onloadedmetadata = () => {
                        remoteVideoRef.current.play().catch(e =>
                            console.error("Remote video play error:", e)
                        );
                    };

                    setRemoteStreamActive(true);
                }
            });

            currentCallRef.current.on('close', () => {
                console.log("Call closed (remote)");
                currentCallRef.current = null;
                setCallStarted(false);
                setCallType(null);
                setRemoteStreamActive(false);
                cleanupLocalStream();
            });

            currentCallRef.current.on('error', (err) => {
                console.error("Call error:", err);
                alert('Call connection error: ' + err.message);
                endCall(true);
            });

            setCallStarted(true);
            setCallType('video');

            socket.emit("accept-call", {
                to: incomingCall.from,
                from: loggedInUser.id,
                chatId: selectedChat._id
            });

            setIncomingCall(null);

        } catch (error) {
            console.error("Error accepting call:", error);
            if (error.name === "NotAllowedError") {
                alert("Camera/Microphone access denied. Please allow permissions.");
            } else if (error.name === "NotFoundError") {
                alert("No camera or microphone found on your device.");
            } else if (error.name === "NotReadableError" || error.message.includes("in use")) {
                alert("Camera/Microphone is in use by another application. Please close other apps and try again.");
            } else {
                alert("Unable to access camera/microphone: " + error.message);
            }
            await cleanupLocalStream();
            rejectCall();
        } finally {
            setIsConnecting(false);
            isAcceptingCall.current = false;
        }
    };

    // Reject incoming call
    const rejectCall = () => {
        if (currentCallRef.current) {
            currentCallRef.current.close();
            currentCallRef.current = null;
        }

        if (incomingCall) {
            socket.emit("reject-call", {
                to: incomingCall.from,
                from: loggedInUser.id,
                chatId: selectedChat._id
            });
            setIncomingCall(null);
        }

        cleanupLocalStream();
    };

    // End active call
    const endCall = async (emitToOther = true) => {
        console.log("Ending call and releasing devices...");

        // Stop local stream
        await cleanupLocalStream();

        // Close peer call
        if (currentCallRef.current) {
            try {
                currentCallRef.current.close();
            } catch (err) {
                console.error("Error closing call:", err);
            }
            currentCallRef.current = null;
        }

        if (emitToOther) {
            socket.emit("end-call", {
                to: selectedUser._id,
                from: loggedInUser.id,
                chatId: selectedChat._id
            });
        }

        setCallStarted(false);
        setCallType(null);
        setIsVideoEnabled(true);
        setIsAudioEnabled(true);
        setIsConnecting(false);
        setRemoteStreamActive(false);
        isRemoteStreamSetRef.current = false;
        isAcceptingCall.current = false;
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoEnabled(videoTrack.enabled);
            }
        }
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsAudioEnabled(audioTrack.enabled);
            }
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupLocalStream();
            if (currentCallRef.current) {
                currentCallRef.current.close();
                currentCallRef.current = null;
            }
        };
    }, []);

    const isOnline = onlineUsers?.includes(selectedUser?._id);

    if (!selectedChat) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <FiUser className="text-3xl text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg">Select a chat</p>
                <p className="text-gray-400 text-sm mt-1">Start a conversation</p>
            </div>
        );
    }

    if (!loggedInUser) {
        return null;
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 relative">

            {/* Incoming Call Notification */}
            {incomingCall && !callStarted && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold mb-2">Incoming Video Call</h3>
                        <p className="text-gray-600 mb-4">{incomingCall.fromName} is calling you...</p>
                        <div className="flex gap-3">
                            <button
                                onClick={acceptCall}
                                disabled={isConnecting}
                                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                            >
                                {isConnecting ? 'Connecting...' : 'Accept'}
                            </button>
                            <button
                                onClick={rejectCall}
                                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Call UI */}
            {callStarted && (
                <div className="fixed inset-0 bg-gray-900 z-50">
                    <div className="relative h-full">
                        {/* Remote Video */}
                        {callType === 'video' ? (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiUser className="text-5xl text-white" />
                                    </div>
                                    <h3 className="text-white text-xl font-semibold">{selectedUser?.name}</h3>
                                    <p className="text-gray-400">Audio Call in Progress...</p>
                                </div>
                            </div>
                        )}

                        {/* Local Video (Picture-in-Picture) */}
                        {callType === 'video' && (
                            <div className="absolute bottom-24 right-4 w-48 h-64 bg-black rounded-lg overflow-hidden shadow-lg border-2 border-white">
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Debug Info */}
                        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-xs p-2 rounded font-mono">
                            Remote: {remoteStreamActive ? '✓' : '✗'} |
                            Local: {localStreamRef.current ? '✓' : '✗'}
                        </div>

                        {/* Call Controls */}
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                            <button
                                onClick={toggleAudio}
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                                    } text-white transition-colors`}
                            >
                                {isAudioEnabled ? <FiMic size={20} /> : <FiMicOff size={20} />}
                            </button>

                            {callType === 'video' && (
                                <button
                                    onClick={toggleVideo}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                                        } text-white transition-colors`}
                                >
                                    {isVideoEnabled ? <FiVideo size={20} /> : <FiVideoOff size={20} />}
                                </button>
                            )}

                            <button
                                onClick={endCall}
                                className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors"
                            >
                                <FiPhoneOff size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm pt-16">
                <div className="flex items-center justify-between px-4 py-3">

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        >
                            <FiArrowLeft className="text-xl text-gray-600" />
                        </button>

                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                {selectedUser?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            {isOnline && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                            )}
                        </div>

                        <div>
                            <div className="font-semibold text-gray-800 text-lg">
                                {selectedUser?.name || ""}
                            </div>
                            <div className="text-xs flex items-center gap-1">
                                {isOnline ? (
                                    <>
                                        <FiCircle className="text-green-500 text-xs fill-green-500" />
                                        <span className="text-green-600 font-medium">Online</span>
                                    </>
                                ) : (
                                    <span className="text-gray-400">
                                        Last seen {formatLastSeen(selectedUser?.lastSeen)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => startCall('audio')}
                            disabled={callStarted || isConnecting || !peerReady}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                        >
                            <FiPhone className="text-gray-600 text-lg" />
                        </button>
                        <button
                            onClick={() => startCall('video')}
                            disabled={callStarted || isConnecting || !peerReady}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                        >
                            <FiVideo className="text-gray-600 text-lg" />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                            >
                                <FiMoreVertical className="text-gray-600 text-lg" />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                                    <Link to="/user-profile" state={{ user: selectedUser }}>
                                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
                                            <FiInfo className="text-gray-400" />
                                            View Profile
                                        </button>
                                    </Link>
                                    <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
                                        <FiUser className="text-red-400" />
                                        Block User
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages?.length > 0 ? (
                    messages.map((msg, index) => {
                        const senderId = msg.sender?._id || msg.sender;
                        const isMe = senderId?.toString() === loggedInUser.id.toString();
                        const showAvatar = !isMe && (index === 0 ||
                            (messages[index - 1] && (messages[index - 1].sender?._id || messages[index - 1].sender) !== senderId));

                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`flex ${isMe ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[85%] md:max-w-[70%]`}>

                                    {!isMe && showAvatar && (
                                        <div className="flex-shrink-0 mb-1">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                                {selectedUser?.name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                        </div>
                                    )}

                                    {!isMe && !showAvatar && (
                                        <div className="w-8 flex-shrink-0"></div>
                                    )}

                                    <div className="group relative">
                                        <div
                                            className={`
                                                rounded-2xl
                                                break-words whitespace-pre-wrap
                                                ${isMe
                                                    ? "bg-blue-600 text-white rounded-br-md"
                                                    : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"}
                                                ${msg.imageUrl ? 'p-0' : 'px-4 py-2.5'}
                                            `}
                                        >
                                            {msg.imageUrl ? (
                                                <div className="flex flex-col gap-2">
                                                    <img
                                                        src={msg.imageUrl}
                                                        alt={msg.imageName || "Image"}
                                                        className="max-w-full max-h-64 rounded-lg cursor-pointer"
                                                        onClick={() => window.open(msg.imageUrl, '_blank')}
                                                        onError={(e) => {
                                                            console.error("Image failed to load:", msg.imageUrl);
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = '<p class="text-red-500">Failed to load image</p>';
                                                        }}
                                                    />
                                                    {msg.text && <p className="mt-1">{msg.text}</p>}
                                                </div>
                                            ) : (
                                                msg?.text || ""
                                            )}
                                        </div>

                                        <div className={`flex items-center gap-1 mt-1 text-xs ${isMe ? "justify-end" : "justify-start"}`}>
                                            <span className={`text-gray-400 ${isMe ? "mr-1" : "ml-1"}`}>
                                                {formatMessageTime(msg.createdAt)}
                                            </span>
                                            {isMe && (
                                                <span className="text-gray-400">
                                                    {msg.readBy?.length > 1 ?
                                                        <FiCheckCircle className="text-blue-500 text-xs" /> :
                                                        <FiCheck className="text-gray-400 text-xs" />
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <FiUser className="text-2xl text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-sm">No messages yet</p>
                        <p className="text-gray-400 text-xs mt-1">Start the conversation</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3">
                <MessageInput
                    onSend={handleSendMessage}
                    onSendImage={handleSendImage}
                    chatId={selectedChat._id}
                    senderId={loggedInUser.id}
                    isUploading={sendingImage}
                />
            </div>
        </div>
    );
};

export default ChatWindow;