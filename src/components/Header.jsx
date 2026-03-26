import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import socket from "../socket";
import api from "../api/api";
import { toast, Toaster } from "react-hot-toast";


const Header = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { user, logout } = useAuth();

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

            <header className="w-full bg-emerald-200 shadow-sm fixed top-0">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

                    {user && (
                        <>
                            {/* Logo / Brand */}
                            < div className="text-xl font-bold text-blue-600 cursor-pointer">
                                <Link to="/">{user.name}</Link>
                            </div>

                            {/* Navigation */}
                            <nav className="hidden md:flex items-center space-x-6">
                                <span className="text-gray-600 hover:text-blue-600 cursor-pointer">
                                    <Link to="/">Home</Link>
                                </span>

                                <span className="text-gray-600 hover:text-blue-600 cursor-pointer">
                                    About
                                </span>

                                <span className="text-gray-600 hover:text-blue-600 cursor-pointer">
                                    Contact
                                </span>
                            </nav>
                        </>
                    )}

                    {/* Auth Buttons */}

                    <div className="flex items-center space-x-3">
                        {!user && (
                            <>
                                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600">
                                    <Link to="/login">Login</Link>
                                </button>
                                <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                    <Link to="/register">Register</Link>
                                </button>
                            </>
                        )}

                        {user && (
                            <>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    Logout
                                    {isLoading && (
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                </button>

                                <button
                                    onClick={handleAddFriend}
                                    className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    Add Friend
                                </button>
                            </>

                        )}
                    </div>

                </div>
            </header >
        </>
    );
};

export default Header;