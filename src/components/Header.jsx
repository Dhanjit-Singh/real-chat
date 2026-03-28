import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";
import api from "../api/api";
import { toast, Toaster } from "react-hot-toast";
import { FiMoreVertical } from "react-icons/fi";


const Header = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            socket.disconnect();
            const fcmToken = localStorage.getItem("fcmToken");
            const response = await api.post("/api/users/logout", {
                userId: user.id,
                token: fcmToken
            });
            if (response.data.status === true) {
                setIsLoading(false);
                toast.success(response.data.message);
                console.log("logout successful");
                localStorage.removeItem("fcmToken");
            }
        } catch (error) {
            console.log("Logout API failed", error);
            toast.error(error.response?.data?.message || "Something went wrong");
            setIsLoading(false);
        } finally {
            setIsLoading(false);
            logout();
            navigate("/login");
        }
    };

    const handleAddFriend = () => {
        navigate("/add-friend");
    };

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 5000,
                    style: {
                        background: "#fff",
                        color: "#333",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        padding: "16px",
                    },
                }}
            />

            <header className="w-full bg-white/80 backdrop-blur-md shadow-lg fixed top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">

                    {/* LEFT SIDE - Modern Logo */}
                    {user ? (
                        <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition">
                            <Link to="/" onClick={() => setMenuOpen(false)}>{user.name}</Link>
                        </div>
                    ) : (
                        <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            <Link to="/" onClick={() => setMenuOpen(false)}>Dhanjit's App</Link>
                        </div>
                    )}

                    {/* DESKTOP NAV - Modern Links with Hover Effects */}
                    {user && (
                        <nav className="hidden md:flex items-center space-x-1">
                            <Link
                                to="/my-profile"
                                onClick={() => setMenuOpen(false)}
                                className="px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                            >
                                Profile
                            </Link>
                            <Link
                                to="/about-us"
                                onClick={() => setMenuOpen(false)}
                                className="px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                            >
                                About
                            </Link>
                            <Link
                                to="/faq"
                                onClick={() => setMenuOpen(false)}
                                className="px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                            >
                                FAQ's
                            </Link>
                        </nav>
                    )}

                    {/* RIGHT SIDE - Modern Buttons */}
                    <div className="flex items-center space-x-3">

                        {/* DESKTOP BUTTONS - Enhanced Design */}
                        {!user && (
                            <div className="hidden md:flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium px-3 py-2"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMenuOpen(false)}
                                    className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    Register
                                </Link>
                            </div>
                        )}

                        {user && (
                            <div className="hidden md:flex items-center space-x-3">
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMenuOpen(false);
                                    }}
                                    className="px-5 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow-md flex gap-2 items-center"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                    </svg>
                                    Logout
                                    {isLoading && (
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                </button>

                                <button
                                    onClick={() => {
                                        handleAddFriend();
                                        setMenuOpen(false);
                                    }}
                                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    Add Friend
                                </button>
                            </div>
                        )}

                    </div>

                    {/* MOBILE MENU BUTTON - Modern Style */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                    >
                        <FiMoreVertical className="text-gray-700 text-xl" />
                    </button>
                </div>

                {/* MOBILE DROPDOWN - Modern Slide Animation */}
                {menuOpen && (
                    <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg border-t border-gray-100 px-4 py-4 space-y-2 animate-slideDown">
                        {user && (
                            <>
                                <Link to="/my-profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                    Profile
                                </Link>
                                <Link to="/about-us" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    About
                                </Link>
                                <Link to="/faq" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"></path>
                                    </svg>
                                    FAQ's
                                </Link>

                                <button
                                    onClick={() => {
                                        handleAddFriend();
                                        setMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all duration-200 font-medium flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                    </svg>
                                    Add Friend
                                </button>

                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 font-medium flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                    </svg>
                                    Logout
                                    {isLoading && (
                                        <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                </button>
                            </>
                        )}

                        {!user && (
                            <>
                                <Link
                                    to="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMenuOpen(false)}
                                    className="block px-4 py-3 rounded-lg text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;