import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "../../../api/api";
import { toast } from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus, FiArrowRight, FiCheckCircle } from "react-icons/fi";

const Register = () => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleInputs = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev, [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post("/api/users/create", formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.data.status === true) {
                setIsLoading(false);
                toast.success(response.data.message);
                navigate("/login");
            }
        } catch (error) {
            console.log("Registration failed====>>>", error);
            toast.error(error.response?.data?.message || "Something went wrong");
            setIsLoading(false);
        }
    };

    // Password strength checker
    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return null;

        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;

        if (strength <= 1) return { text: "Weak", color: "text-red-500", bg: "bg-red-500" };
        if (strength === 2) return { text: "Fair", color: "text-yellow-500", bg: "bg-yellow-500" };
        if (strength === 3) return { text: "Good", color: "text-blue-500", bg: "bg-blue-500" };
        return { text: "Strong", color: "text-green-500", bg: "bg-green-500" };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8 mt-10">
                <div className="w-full max-w-md">

                    {/* Logo/Brand Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
                            <FiUserPlus className="text-white text-2xl" />
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Create Account
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Join our community and start chatting
                        </p>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

                            {/* Name Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <FiUser className="text-gray-400 text-sm" />
                                        <span>Full Name</span>
                                    </div>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputs}
                                    autoComplete="new-name"
                                    placeholder="Enter your full name"
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${errors.name ? "border-red-400 focus:ring-red-500" : "border-gray-200 focus:border-blue-400"
                                        }`}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <span>⚠️</span> {errors.name}
                                    </p>
                                )}
                            </div>

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
                                    autoComplete="new-email"
                                    placeholder="Enter your email"
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${errors.email ? "border-red-400 focus:ring-red-500" : "border-gray-200 focus:border-blue-400"
                                        }`}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <span>⚠️</span> {errors.email}
                                    </p>
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
                                        autoComplete="new-password"
                                        placeholder="Create a password"
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

                                {/* Password Strength Indicator */}
                                {formData.password && !errors.password && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${passwordStrength?.bg} transition-all duration-300`}
                                                    style={{
                                                        width: passwordStrength?.text === "Weak" ? "25%" :
                                                            passwordStrength?.text === "Fair" ? "50%" :
                                                                passwordStrength?.text === "Good" ? "75%" : "100%"
                                                    }}
                                                ></div>
                                            </div>
                                            <span className={`text-xs ${passwordStrength?.color} font-medium`}>
                                                {passwordStrength?.text}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Use 6+ chars with letters, numbers & symbols
                                        </p>
                                    </div>
                                )}

                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <span>⚠️</span> {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <FiLock className="text-gray-400 text-sm" />
                                        <span>Confirm Password</span>
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputs}
                                        autoComplete="off"
                                        placeholder="Confirm your password"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 pr-12 ${errors.confirmPassword ? "border-red-400 focus:ring-red-500" : "border-gray-200 focus:border-blue-400"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showConfirmPassword ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <span>⚠️</span> {errors.confirmPassword}
                                    </p>
                                )}
                                {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                                    <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                                        <FiCheckCircle className="text-xs" /> Passwords match
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Creating account...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <FiArrowRight className="text-lg" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Terms & Conditions */}
                        <p className="text-xs text-center text-gray-400 mt-6">
                            By creating an account, you agree to our
                            <Link to="/terms" className="text-blue-600 hover:underline mx-1">Terms of Service</Link>
                            and
                            <Link to="/privacy" className="text-blue-600 hover:underline ml-1">Privacy Policy</Link>
                        </p>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-gray-400">or</span>
                            </div>
                        </div>

                        {/* Footer */}
                        <p className="text-sm text-center text-gray-600">
                            Already have an account?
                            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline ml-1 transition-colors duration-200">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;