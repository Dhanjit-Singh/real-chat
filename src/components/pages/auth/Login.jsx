import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/api";
import { toast } from "react-hot-toast";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiArrowRight } from "react-icons/fi";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleInputs = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev, [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.post("/api/users/login", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.data.status === true) {
                login(response.data.user);
                toast.success(response.data.message);
                navigate("/");
                setIsLoading(false);
            }
        } catch (error) {
            console.log("Login failed====>>>", error);
            toast.error(error.response?.data?.message || "Something went wrong");
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8 mt-10">
                <div className="w-full max-w-md">

                    {/* Logo/Brand Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
                            <FiLogIn className="text-white text-2xl" />
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Welcome Back
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Sign in to continue to your account
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <FiMail className="text-gray-400 text-sm" />
                                        <span>Email Address</span>
                                    </div>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputs}
                                    placeholder="Enter your email"
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${errors.email ? "border-red-400 focus:ring-red-500" : "border-gray-200 focus:border-blue-400"
                                        }`}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <FiLock className="text-gray-400 text-sm" />
                                        <span>Password</span>
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputs}
                                        placeholder="Enter your password"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 pr-12 ${errors.password ? "border-red-400 focus:ring-red-500" : "border-gray-200 focus:border-blue-400"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Forgot Password Link */}
                            <div className="text-right">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <FiArrowRight className="text-lg" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-gray-400">or</span>
                            </div>
                        </div>

                        {/* Demo Credentials */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <p className="text-xs text-gray-500 text-center mb-2">Demo Credentials</p>
                            <div className="text-xs text-gray-600 space-y-1">
                                <p className="flex justify-between">
                                    <span>Email:</span>
                                    <span className="font-mono text-blue-600">demo@realchat.com</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>Password:</span>
                                    <span className="font-mono text-blue-600">••••••••</span>
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <p className="text-sm text-center text-gray-600">
                            Don't have an account?
                            <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline ml-1 transition-colors duration-200">
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;