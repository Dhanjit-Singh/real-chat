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

    const [callStarted, setCallStarted] = useState(false);
    const [callType, setCallType] = useState(null);
    const [incomingCall, setIncomingCall] = useState(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [peerReady, setPeerReady] = useState(false);
    const [remoteStreamActive, setRemoteStreamActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null); // For non-intrusive errors

    const messagesEndRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerRef = useRef(null);
    const localStreamRef = useRef(null);
    const currentCallRef = useRef(null);
    const isAcceptingCall = useRef(false);
    const callEndedRef = useRef(false); // Prevent duplicate call endings

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

            // Don't show incoming call if already in a call
            if (callStarted) {
                console.log("Already in a call, rejecting...");
                call.close();
                return;
            }

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
                setErrorMessage("User is not available for call");
                setTimeout(() => setErrorMessage(null), 3000);
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
            // Don't show alert here
        };

        const handleCallRejected = () => {
            console.log("📡 call-rejected event received");
            if (!callEndedRef.current) {
                setErrorMessage("Call was rejected");
                setTimeout(() => setErrorMessage(null), 3000);
                endCall(true);
            }
        };

        const handleCallEnded = () => {
            console.log("📡 call-ended event received");
            if (!callEndedRef.current && callStarted) {
                setErrorMessage("Call ended by other user");
                setTimeout(() => setErrorMessage(null), 3000);
                endCall(false); // Don't emit end-call again
            }
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
    }, [callStarted]);

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

    // Cleanup local stream
    const cleanupLocalStream = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            localStreamRef.current = null;
        }

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    };

    // Start a call
    const startCall = async (type) => {
        console.log("startCall called with type:", type);

        if (isConnecting || callStarted) {
            console.log("Already connecting or in call, skipping...");
            return;
        }

        if (!peerRef.current || !peerReady) {
            console.error("PeerJS not initialized or not ready");
            setErrorMessage("Call system is initializing. Please wait...");
            setTimeout(() => setErrorMessage(null), 3000);
            return;
        }

        setIsConnecting(true);
        callEndedRef.current = false;

        try {
            // Cleanup any existing stream
            cleanupLocalStream();

            const constraints = {
                video: type === 'video',
                audio: true
            };

            console.log("Requesting media devices...");
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log("✅ Got media stream");

            localStreamRef.current = stream;

            // Display local video (small window)
            if (localVideoRef.current && type === 'video') {
                console.log("Setting local video stream on caller side");
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.muted = true;

                localVideoRef.current.play().catch(e => console.log("Local video play error:", e));
            }

            console.log("Making call to:", selectedUser._id);

            // Make the call with the stream
            const call = peerRef.current.call(selectedUser._id, stream);
            currentCallRef.current = call;

            // Handle remote stream (receiver's video)
            call.on('stream', (remoteStream) => {
                console.log("📹 Caller received remote stream from receiver!");

                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.play()
                        .then(() => {
                            console.log("✅ Remote video playing on caller side");
                            setRemoteStreamActive(true);
                        })
                        .catch(e => console.error("Remote video play error:", e));
                }
            });

            call.on('close', () => {
                console.log("Call closed");
                if (!callEndedRef.current) {
                    callEndedRef.current = true;
                    endCall(false);
                }
            });

            call.on('error', (err) => {
                console.error('Call error:', err);
                setErrorMessage("Call connection failed");
                setTimeout(() => setErrorMessage(null), 3000);
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
            setErrorMessage("Unable to access camera/microphone");
            setTimeout(() => setErrorMessage(null), 3000);
            endCall(true);
        } finally {
            setIsConnecting(false);
        }
    };

    // Accept incoming call
    const acceptCall = async () => {
        console.log("Accepting call...");

        if (isAcceptingCall.current || !currentCallRef.current) {
            console.log("Already accepting or no call to accept");
            return;
        }

        isAcceptingCall.current = true;
        setIsConnecting(true);
        callEndedRef.current = false;

        try {
            // Cleanup any existing stream
            cleanupLocalStream();

            const constraints = {
                video: incomingCall?.callType === 'video',
                audio: true
            };

            console.log("Requesting camera/microphone access...");
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log("✅ Got media stream");

            localStreamRef.current = stream;

            // Display local video (small window on receiver side)
            if (localVideoRef.current) {
                console.log("Setting local video stream on receiver side");
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.muted = true;
                localVideoRef.current.play().catch(e => console.log("Local video play error:", e));
            }

            console.log("Answering the call...");

            // CRITICAL: Answer the call with the stream
            currentCallRef.current.answer(stream);
            console.log("Call answered");

            // CRITICAL: Handle remote stream (caller's video)
            // This is where the caller's video comes in
            currentCallRef.current.on('stream', (remoteStream) => {
                console.log("📹 Receiver got remote stream from caller!");
                console.log("Remote stream tracks:", remoteStream.getTracks().length);

                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = remoteStream;
                    remoteVideoRef.current.muted = false;
                    remoteVideoRef.current.play()
                        .then(() => {
                            console.log("✅ Remote video playing on receiver side");
                            setRemoteStreamActive(true);
                        })
                        .catch(e => console.error("Remote video play error:", e));
                }
            });

            currentCallRef.current.on('close', () => {
                console.log("Call closed");
                if (!callEndedRef.current) {
                    callEndedRef.current = true;
                    endCall(false);
                }
            });

            currentCallRef.current.on('error', (err) => {
                console.error("Call error:", err);
                setErrorMessage("Call connection error");
                setTimeout(() => setErrorMessage(null), 3000);
                endCall(true);
            });

            setCallStarted(true);
            setCallType(incomingCall?.callType || 'video');

            socket.emit("accept-call", {
                to: incomingCall.from,
                from: loggedInUser.id,
                chatId: selectedChat._id
            });

            setIncomingCall(null);

        } catch (error) {
            console.error("Error accepting call:", error);
            setErrorMessage("Unable to access camera/microphone");
            setTimeout(() => setErrorMessage(null), 3000);
            rejectCall();
        } finally {
            setIsConnecting(false);
            isAcceptingCall.current = false;
        }
    };

    // Add this useEffect to verify video elements are ready
    useEffect(() => {
        if (callStarted && callType === 'video') {
            console.log("Video elements status:");
            console.log("- Local video element:", localVideoRef.current);
            console.log("- Remote video element:", remoteVideoRef.current);
            console.log("- Local stream:", localStreamRef.current);

            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                if (localVideoRef.current && localStreamRef.current) {
                    if (!localVideoRef.current.srcObject) {
                        console.log("Re-attaching local stream");
                        localVideoRef.current.srcObject = localStreamRef.current;
                        localVideoRef.current.play().catch(e => console.log("Play error:", e));
                    }
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [callStarted, callType]);

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
    const endCall = (emitToOther = true) => {
        console.log("Ending call, emitToOther:", emitToOther);

        if (callEndedRef.current && emitToOther) {
            console.log("Call already ended, skipping...");
            return;
        }

        callEndedRef.current = true;

        // Stop local stream
        cleanupLocalStream();

        // Close peer call
        if (currentCallRef.current) {
            try {
                currentCallRef.current.close();
            } catch (err) {
                console.error("Error closing call:", err);
            }
            currentCallRef.current = null;
        }

        // Notify other user
        if (emitToOther && selectedUser?._id) {
            socket.emit("end-call", {
                to: selectedUser._id,
                from: loggedInUser.id,
                chatId: selectedChat._id
            });
        }

        // Reset states
        setCallStarted(false);
        setCallType(null);
        setIsVideoEnabled(true);
        setIsAudioEnabled(true);
        setIsConnecting(false);
        setRemoteStreamActive(false);
        setIncomingCall(null);
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

    // Add this useEffect after your other useEffects to handle video track renegotiation
    useEffect(() => {
        if (!callStarted || !currentCallRef.current) return;

        // This ensures that if video tracks are added/removed during the call, they're handled
        const handleNegotiationNeeded = () => {
            console.log("Negotiation needed - renegotiating tracks");
            if (currentCallRef.current && localStreamRef.current) {
                // Re-add tracks if needed
                localStreamRef.current.getTracks().forEach(track => {
                    if (currentCallRef.current.peerConnection) {
                        const sender = currentCallRef.current.peerConnection
                            .getSenders()
                            .find(s => s.track?.kind === track.kind);
                        if (sender && sender.track !== track) {
                            sender.replaceTrack(track);
                        }
                    }
                });
            }
        };

        if (currentCallRef.current.peerConnection) {
            currentCallRef.current.peerConnection.onnegotiationneeded = handleNegotiationNeeded;
        }

        return () => {
            if (currentCallRef.current?.peerConnection) {
                currentCallRef.current.peerConnection.onnegotiationneeded = null;
            }
        };
    }, [callStarted, currentCallRef.current, localStreamRef.current]);

    if (!loggedInUser) {
        return null;
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 relative">

            {/* Error Message Toast */}
            {errorMessage && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
                    {errorMessage}
                </div>
            )}

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
                                onClick={() => endCall(true)}
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