import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
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
            <Toaster position="top-right"
                toastOptions={{
                    duration: 5000,
                    style: {
                        background: "#fff",
                        color: "#333",
                    },
                }}
            />

            <header className="w-full bg-emerald-200 shadow-sm fixed top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

                    {/* LEFT SIDE */}
                    {user && (
                        <div className="text-xl font-bold text-blue-600">
                            <Link to="/">{user.name}</Link>
                        </div>
                    )}

                    {/* DESKTOP NAV */}
                    {user && (
                        <nav className="hidden md:flex items-center space-x-6">
                            <Link className="text-gray-600 hover:text-blue-600" to="/">Home</Link>
                            <Link className="text-gray-600 hover:text-blue-600" to="/about-us">About</Link>
                            <Link className="text-gray-600 hover:text-blue-600" to="/faq">FAQ's</Link>
                        </nav>
                    )}

                    {/* RIGHT SIDE */}
                    <div className="flex items-center space-x-3">

                        {/* DESKTOP BUTTONS */}
                        {!user && (
                            <div className="hidden md:flex items-center space-x-3">
                                <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
                                <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Register</Link>
                            </div>
                        )}

                        {user && (
                            <div className="hidden md:flex items-center space-x-3">
                                <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg flex gap-2">
                                    Logout
                                    {isLoading && (
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                </button>

                                <button onClick={handleAddFriend} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                                    Add Friend
                                </button>
                            </div>
                        )}

                        {/* MOBILE MENU BUTTON */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden text-xl"
                        >
                            <FiMoreVertical />
                        </button>
                    </div>
                </div>

                {/* MOBILE DROPDOWN */}
                {menuOpen && (
                    <div className="md:hidden bg-white shadow-md px-4 py-3 space-y-3">

                        {user && (
                            <>
                                <Link to="/" onClick={() => setMenuOpen(false)} className="block">Home</Link>
                                <Link to="/about-us" onClick={() => setMenuOpen(false)} className="block">About</Link>
                                <Link to="/faq" onClick={() => setMenuOpen(false)} className="block">FAQ's</Link>

                                <button
                                    onClick={() => {
                                        handleAddFriend();
                                        setMenuOpen(false);
                                    }}
                                    className="w-full text-left text-blue-600"
                                >
                                    Add Friend
                                </button>

                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMenuOpen(false);
                                    }}
                                    className="w-full text-left text-red-500 flex items-center gap-2"
                                >
                                    Logout
                                    {isLoading && (
                                        <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                </button>
                            </>
                        )}

                        {!user && (
                            <>
                                <Link to="/login" className="block">Login</Link>
                                <Link to="/register" className="block text-blue-600">Register</Link>
                            </>
                        )}
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;