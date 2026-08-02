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
    const [callConnecting, setCallConnecting] = useState(false); // ✅ ADDED
    const [peerReady, setPeerReady] = useState(true);
    const [remoteStreamActive, setRemoteStreamActive] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [callDuration, setCallDuration] = useState(0);
    const [pendingOffer, setPendingOffer] = useState(null);

    const remoteAudioRef = useRef(null);
    const messagesEndRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const isAcceptingCall = useRef(false);
    const callEndedRef = useRef(false);
    const remoteStreamRef = useRef(null);
    const callTimerRef = useRef(null);

    // Socket event listeners for WebRTC signaling
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

        // ✅ Handle WebRTC offer from mobile
        const handleWebRTCOffer = async (data) => {
            console.log('📞 Received WebRTC offer from:', data.from);
            console.log('📦 Offer:', data.offer);
            
            setPendingOffer(data.offer);
            setIncomingCall({
                from: data.from,
                fromName: selectedUser?.name || 'User',
                callType: data.callType || 'audio'
            });
        };

        // ✅ Handle WebRTC answer from mobile
        const handleWebRTCAnswer = async (data) => {
            console.log('📞 Received WebRTC answer from:', data.from);
            
            if (peerConnectionRef.current && !peerConnectionRef.current.currentRemoteDescription) {
                try {
                    await peerConnectionRef.current.setRemoteDescription(
                        new RTCSessionDescription(data.answer)
                    );
                    console.log('✅ Remote description set (answer)');
                    setCallConnecting(false);
                } catch (error) {
                    console.error('❌ Error setting remote description:', error);
                }
            }
        };

        // ✅ Handle ICE candidates
        const handleWebRTCIceCandidate = async (data) => {
            console.log('🧊 Received ICE candidate from:', data.from);
            
            if (peerConnectionRef.current) {
                try {
                    await peerConnectionRef.current.addIceCandidate(
                        new RTCIceCandidate(data.candidate)
                    );
                    console.log('✅ ICE candidate added');
                } catch (error) {
                    console.error('❌ Error adding ICE candidate:', error);
                }
            }
        };

        // ✅ Handle call ended
        const handleWebRTCCallEnded = () => {
            console.log('📞 WebRTC call ended by other user');
            if (!callEndedRef.current && callStarted) {
                setErrorMessage("Call ended by other user");
                setTimeout(() => setErrorMessage(null), 3000);
                endCall(false);
            }
        };

        // ✅ Handle call rejected
        const handleWebRTCCallRejected = () => {
            console.log('📞 WebRTC call rejected by other user');
            if (!callEndedRef.current) {
                setErrorMessage("Call was rejected");
                setTimeout(() => setErrorMessage(null), 3000);
                endCall(true);
            }
        };

        // Legacy events (keep for compatibility)
        const handleCallAccepted = ({ from }) => {
            console.log("✅ Call accepted by user:", from);
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
                endCall(false);
            }
        };

        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("receiveImage", handleReceiveImage);
        
        // ✅ WebRTC signaling events
        socket.on("webrtc-offer", handleWebRTCOffer);
        socket.on("webrtc-answer", handleWebRTCAnswer);
        socket.on("webrtc-ice-candidate", handleWebRTCIceCandidate);
        socket.on("webrtc-call-ended", handleWebRTCCallEnded);
        socket.on("webrtc-call-rejected", handleWebRTCCallRejected);
        
        // Legacy events
        socket.on("call-accepted", handleCallAccepted);
        socket.on("call-rejected", handleCallRejected);
        socket.on("call-ended", handleCallEnded);

        return () => {
            socket.off("receiveMessage", handleReceiveMessage);
            socket.off("receiveImage", handleReceiveImage);
            socket.off("webrtc-offer", handleWebRTCOffer);
            socket.off("webrtc-answer", handleWebRTCAnswer);
            socket.off("webrtc-ice-candidate", handleWebRTCIceCandidate);
            socket.off("webrtc-call-ended", handleWebRTCCallEnded);
            socket.off("webrtc-call-rejected", handleWebRTCCallRejected);
            socket.off("call-accepted", handleCallAccepted);
            socket.off("call-rejected", handleCallRejected);
            socket.off("call-ended", handleCallEnded);
        };
    }, [callStarted, selectedUser]);

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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

    useEffect(() => {
        if (callStarted && callType === 'video') {
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

    useEffect(() => {
        if (callStarted && remoteVideoRef.current && remoteStreamRef.current) {
            console.log("Re-attaching remote stream after DOM ready");
            remoteVideoRef.current.srcObject = remoteStreamRef.current;
            remoteVideoRef.current.play()
                .then(() => setRemoteStreamActive(true))
                .catch(e => console.error("Play error:", e));
        }
    }, [callStarted]);

    useEffect(() => {
        if (callStarted && callType === 'audio' && remoteAudioRef.current && remoteStreamRef.current) {
            remoteAudioRef.current.srcObject = remoteStreamRef.current;
            remoteAudioRef.current.muted = false;
            remoteAudioRef.current.play()
                .then(() => console.log("🔊 Audio reattached"))
                .catch((e) => console.error("Audio reattach error:", e));
        }
    }, [callStarted, callType]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanupLocalStream();
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
        };
    }, []);

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

    // ✅ Start call using socket-based signaling
    const startCall = async (type) => {
        console.log("startCall called with type:", type);

        if (isConnecting || callStarted) {
            console.log("Already connecting or in call, skipping...");
            return;
        }

        setIsConnecting(true);
        setCallConnecting(true);
        callEndedRef.current = false;

        try {
            cleanupLocalStream();

            const constraints = {
                video: type === 'video',
                audio: true
            };

            console.log("Requesting media devices...");
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log("✅ Got media stream");

            localStreamRef.current = stream;

            if (localVideoRef.current && type === 'video') {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.muted = true;
                localVideoRef.current.play().catch(e => console.log("Local video play error:", e));
            }

            // ✅ Create RTCPeerConnection
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    {
                        urls: 'turn:openrelay.metered.ca:80',
                        username: 'openrelayproject',
                        credential: 'openrelayproject',
                    },
                    {
                        urls: 'turn:openrelay.metered.ca:443',
                        username: 'openrelayproject',
                        credential: 'openrelayproject',
                    }
                ]
            });

            peerConnectionRef.current = pc;

            // Add local stream tracks
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            // Handle remote stream
            pc.ontrack = (event) => {
                console.log("📹 Received remote stream");
                remoteStreamRef.current = event.streams[0];
                setRemoteStreamActive(true);

                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = event.streams[0];
                    remoteAudioRef.current.play().catch(() => {});
                }

                if (event.streams[0].getVideoTracks().length > 0 && remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    remoteVideoRef.current.play().catch(() => {});
                }
            };

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("🧊 Sending ICE candidate");
                    socket.emit("webrtc-ice-candidate", {
                        to: selectedUser._id,
                        from: loggedInUser.id,
                        candidate: event.candidate
                    });
                }
            };

            // Handle connection state changes
            pc.onconnectionstatechange = () => {
                console.log("🔗 Connection state:", pc.connectionState);
                if (pc.connectionState === 'connected') {
                    setCallConnecting(false);
                } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                    if (!callEndedRef.current) {
                        endCall(true);
                    }
                }
            };

            // ✅ Create and send offer
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: type === 'video'
            });
            await pc.setLocalDescription(offer);

            // ✅ Send WebRTC offer via socket
            socket.emit("webrtc-offer", {
                to: selectedUser._id,
                from: loggedInUser.id,
                offer: offer,
                callType: type
            });
            console.log("📤 WebRTC offer sent to:", selectedUser._id);

            // ✅ Also send legacy initiate-call for notification
            socket.emit("initiate-call", {
                to: selectedUser._id,
                from: loggedInUser.id,
                fromName: loggedInUser.name,
                chatId: selectedChat._id,
                callType: type
            });

            setCallStarted(true);
            setCallType(type);
            startTimer();

        } catch (error) {
            console.error("❌ Error in startCall:", error);
            setErrorMessage("Unable to access camera/microphone");
            setTimeout(() => setErrorMessage(null), 3000);
            endCall(true);
        } finally {
            setIsConnecting(false);
        }
    };

    // ✅ Accept incoming call using socket-based signaling
    const acceptCall = async () => {
        console.log("Accepting call...");

        if (isAcceptingCall.current || !incomingCall) {
            console.log("Already accepting or no call to accept");
            return;
        }

        isAcceptingCall.current = true;
        setIsConnecting(true);
        setCallConnecting(true);
        callEndedRef.current = false;

        try {
            cleanupLocalStream();

            const constraints = {
                video: incomingCall?.callType === 'video',
                audio: true
            };

            console.log("Requesting camera/microphone access...");
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log("✅ Got media stream");

            localStreamRef.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                localVideoRef.current.muted = true;
                localVideoRef.current.play().catch(e => console.log("Local video play error:", e));
            }

            // ✅ Create RTCPeerConnection
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                    {
                        urls: 'turn:openrelay.metered.ca:80',
                        username: 'openrelayproject',
                        credential: 'openrelayproject',
                    },
                    {
                        urls: 'turn:openrelay.metered.ca:443',
                        username: 'openrelayproject',
                        credential: 'openrelayproject',
                    }
                ]
            });

            peerConnectionRef.current = pc;

            // Add local stream tracks
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            // Handle remote stream
            pc.ontrack = (event) => {
                console.log("📹 Received remote stream");
                remoteStreamRef.current = event.streams[0];
                setRemoteStreamActive(true);

                if (remoteAudioRef.current) {
                    remoteAudioRef.current.srcObject = event.streams[0];
                    remoteAudioRef.current.play().catch(() => {});
                }

                if (event.streams[0].getVideoTracks().length > 0 && remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    remoteVideoRef.current.play().catch(() => {});
                }
            };

            // Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("🧊 Sending ICE candidate");
                    socket.emit("webrtc-ice-candidate", {
                        to: incomingCall.from,
                        from: loggedInUser.id,
                        candidate: event.candidate
                    });
                }
            };

            // Handle connection state changes
            pc.onconnectionstatechange = () => {
                console.log("🔗 Connection state:", pc.connectionState);
                if (pc.connectionState === 'connected') {
                    setCallConnecting(false);
                } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
                    if (!callEndedRef.current) {
                        endCall(true);
                    }
                }
            };

            // ✅ Set remote description with the offer
            if (pendingOffer) {
                console.log("📦 Setting remote description with pending offer");
                await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer));
                console.log("✅ Remote description set with offer");
                setPendingOffer(null);
            } else {
                // Wait for offer with timeout
                console.log("⏳ Waiting for offer...");
                await waitForOffer(10000);
                if (pendingOffer) {
                    await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer));
                    setPendingOffer(null);
                } else {
                    throw new Error("No offer available");
                }
            }

            // ✅ Create and send answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // ✅ Send WebRTC answer via socket
            socket.emit("webrtc-answer", {
                to: incomingCall.from,
                from: loggedInUser.id,
                answer: answer
            });
            console.log("📤 WebRTC answer sent to:", incomingCall.from);

            // ✅ Send legacy accept-call
            socket.emit("accept-call", {
                to: incomingCall.from,
                from: loggedInUser.id,
                chatId: selectedChat._id
            });

            setCallStarted(true);
            setCallType(incomingCall?.callType || 'video');
            startTimer();
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

    // Helper: Wait for offer with timeout
    const waitForOffer = (timeout) => {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const check = () => {
                if (pendingOffer) {
                    resolve();
                } else if (Date.now() - start > timeout) {
                    reject(new Error('Timeout waiting for offer'));
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    };

    // ✅ Reject call
    const rejectCall = () => {
        if (incomingCall) {
            socket.emit("webrtc-call-rejected", {
                to: incomingCall.from,
                from: loggedInUser.id
            });
            
            socket.emit("reject-call", {
                to: incomingCall.from,
                from: loggedInUser.id,
                chatId: selectedChat._id
            });
            
            setIncomingCall(null);
            setPendingOffer(null);
        }

        cleanupLocalStream();
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
    };

    // ✅ End call
    const endCall = (emitToOther = true) => {
        console.log("Ending call, emitToOther:", emitToOther);
        stopTimer();

        if (callEndedRef.current && emitToOther) {
            console.log("Call already ended, skipping...");
            return;
        }

        callEndedRef.current = true;

        cleanupLocalStream();

        if (peerConnectionRef.current) {
            try {
                peerConnectionRef.current.close();
            } catch (err) {
                console.error("Error closing peer connection:", err);
            }
            peerConnectionRef.current = null;
        }

        if (emitToOther && selectedUser?._id) {
            socket.emit("webrtc-call-ended", {
                to: selectedUser._id,
                from: loggedInUser.id
            });
            
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
        setCallConnecting(false);
        setRemoteStreamActive(false);
        setIncomingCall(null);
        setPendingOffer(null);
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

    const isOnline = onlineUsers?.includes(selectedUser?._id);

    const startTimer = () => {
        setCallDuration(0);
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
        }
        callTimerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }
    };

    const formatCallDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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
                        <h3 className="text-lg font-semibold mb-2">
                            Incoming {incomingCall?.callType === 'audio' ? 'Audio' : 'Video'} Call
                        </h3>
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
                            <>
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />

                                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                                    {formatCallDuration(callDuration)}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiUser className="text-5xl text-white" />
                                    </div>
                                    <h3 className="text-white text-xl font-semibold">{selectedUser?.name}</h3>
                                    <p className="text-gray-400 text-lg mt-2">
                                        {formatCallDuration(callDuration)}
                                    </p>
                                </div>
                            </div>
                        )}

                        <audio ref={remoteAudioRef} autoPlay />

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
                            disabled={callStarted || isConnecting}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                        >
                            <FiPhone className="text-gray-600 text-lg" />
                        </button>
                        <button
                            onClick={() => startCall('video')}
                            disabled={callStarted || isConnecting}
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