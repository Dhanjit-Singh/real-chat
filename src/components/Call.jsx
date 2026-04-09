// components/Call.jsx
import { useState, useEffect, useRef } from "react";
import SimplePeer from "simple-peer";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhone, FiPhoneOff } from "react-icons/fi";

const Call = ({ socket, roomId, userId, recipientId, isInitiator }) => {
    const [callStarted, setCallStarted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [incomingCall, setIncomingCall] = useState(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerRef = useRef(null);
    const localStreamRef = useRef(null);

    useEffect(() => {
        // Listen for incoming calls
        socket.on("incoming-call", ({ from, fromName }) => {
            setIncomingCall({ from, fromName });
        });

        // Listen for call acceptance
        socket.on("call-accepted", ({ signal }) => {
            if (peerRef.current) {
                peerRef.current.signal(signal);
            }
        });

        // Listen for call rejection
        socket.on("call-rejected", () => {
            alert("Call rejected");
            endCall();
        });

        // Listen for call end
        socket.on("call-ended", () => {
            alert("Call ended by other user");
            endCall();
        });

        return () => {
            socket.off("incoming-call");
            socket.off("call-accepted");
            socket.off("call-rejected");
            socket.off("call-ended");
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (peerRef.current) {
                peerRef.current.destroy();
            }
        };
    }, [socket]);

    const startCall = async () => {
        try {
            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            localStreamRef.current = stream;

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Initialize peer connection
            const peer = new SimplePeer({
                initiator: isInitiator,
                trickle: false,
                stream: stream
            });

            peerRef.current = peer;

            // Handle peer signals
            peer.on("signal", (data) => {
                if (isInitiator) {
                    // Send call offer
                    socket.emit("initiate-call", {
                        to: recipientId,
                        from: userId,
                        signal: data,
                        roomId
                    });
                } else {
                    // Send call answer
                    socket.emit("accept-call", {
                        to: recipientId,
                        from: userId,
                        signal: data,
                        roomId
                    });
                }
            });

            peer.on("stream", (stream) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = stream;
                }
            });

            peer.on("close", () => {
                endCall();
            });

            setCallStarted(true);
            setCallEnded(false);

        } catch (error) {
            console.error("Error accessing media devices:", error);
            alert("Unable to access camera/microphone");
        }
    };

    const acceptCall = async () => {
        if (incomingCall) {
            setIsInitiator(false);
            await startCall();
            setIncomingCall(null);
        }
    };

    const rejectCall = () => {
        socket.emit("reject-call", {
            to: incomingCall.from,
            from: userId,
            roomId
        });
        setIncomingCall(null);
    };

    const endCall = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (peerRef.current) {
            peerRef.current.destroy();
        }

        socket.emit("end-call", {
            to: recipientId,
            from: userId,
            roomId
        });

        setCallStarted(false);
        setCallEnded(true);
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoEnabled(videoTrack.enabled);
        }
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setIsAudioEnabled(audioTrack.enabled);
        }
    };

    // Incoming call notification
    if (incomingCall && !callStarted) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                    <h3 className="text-lg font-semibold mb-2">Incoming Call</h3>
                    <p className="text-gray-600 mb-4">{incomingCall.fromName} is calling you...</p>
                    <div className="flex gap-3">
                        <button
                            onClick={acceptCall}
                            className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                        >
                            Accept
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
        );
    }

    // Active call UI
    if (callStarted && !callEnded) {
        return (
            <div className="fixed inset-0 bg-gray-900 z-50">
                <div className="relative h-full">
                    {/* Remote Video (Full Screen) */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />

                    {/* Local Video (Picture-in-Picture) */}
                    <div className="absolute bottom-24 right-4 w-32 h-48 bg-black rounded-lg overflow-hidden shadow-lg">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                        <button
                            onClick={toggleAudio}
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                                } text-white`}
                        >
                            {isAudioEnabled ? <FiMic size={20} /> : <FiMicOff size={20} />}
                        </button>

                        <button
                            onClick={toggleVideo}
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
                                } text-white`}
                        >
                            {isVideoEnabled ? <FiVideo size={20} /> : <FiVideoOff size={20} />}
                        </button>

                        <button
                            onClick={endCall}
                            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white"
                        >
                            <FiPhoneOff size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default Call;