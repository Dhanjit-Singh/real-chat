import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import socket from "../socket";

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            socket.disconnect();
            // const response = await axios.post("http://localhost:5000/api/users/logout",{ userId: user.id });
            const response = await axios.post("https://real-chat-backend-c3nm.onrender.com/api/users/logout",{ userId: user.id });
            if (response.data.status === true) {
                console.log("logout successful");
            }
        } catch (error) {
            console.log("Logout API failed", error);
        } finally {
            
            logout();
            navigate("/login");
        }
    };

    return (
        <header className="w-full bg-emerald-200 shadow-sm fixed top-0">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

                {user && (
                    <>
                        {/* Logo / Brand */}
                        < div className="text-xl font-bold text-blue-600 cursor-pointer">
                            <span>{user.name}</span>
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
                        <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-blue-700 transition">
                            Logout
                        </button>
                    )}
                </div>

            </div>
        </header >
    );
};

export default Header;