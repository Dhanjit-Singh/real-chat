import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleInputs = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev, [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // const response = await axios.post("http://localhost:5000/api/users/login", formData, {
            const response = await axios.post("https://real-chat-backend-c3nm.onrender.com/api/users/login", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.data.status === true) {
                login(response.data.user);
                navigate("/");
            }
        } catch (error) {
            console.log("Login failed====>>>", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

                {/* Title */}
                <h1 className="text-2xl font-bold text-center mb-6">
                    Welcome Back
                </h1>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            onChange={handleInputs}
                            placeholder="Enter your email"
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            onChange={handleInputs}
                            placeholder="Enter your password"
                            className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                </form>

                {/* Footer */}
                <p className="text-sm text-center text-gray-600 mt-6">
                    Don’t have an account?
                    <span className="text-blue-600 cursor-pointer hover:underline">
                        <Link to="/register"> Register</Link> 
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Login;