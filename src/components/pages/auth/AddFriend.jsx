import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import { useAuth } from "../../../context/AuthContext";
import { toast, Toaster } from "react-hot-toast";
import { FiUserPlus, FiUser, FiMail, FiArrowLeft, FiAlertCircle, FiUsers } from "react-icons/fi";

const AddFriend = () => {
    const { user: loggedInUser } = useAuth();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: ""
    });

    const handleInputs = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev, [name]: value
        }));

        setErrors(prev => ({
            ...prev,
            [name]: ""
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
            setErrors(newErrors);
            return;
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
            setErrors(newErrors);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);
        try {
            const response = await api.post("/api/users/add-friend", {
                userId: loggedInUser.id,
                name: formData.name,
                email: formData.email
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.data.status === true) {
                setIsLoading(false);
                toast.success(response.data.message);
                navigate("/");
                setFormData({
                    name: "",
                    email: ""
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
            setIsLoading(false);
        }
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

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-md">

                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
                    >
                        <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="text-sm font-medium">Back</span>
                    </button>

                    {/* Main Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                        {/* Header with Gradient */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                <FiUserPlus className="text-white text-4xl" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                Add Friend
                            </h1>
                            <p className="text-white/80 text-sm">
                                Connect with people you know
                            </p>
                        </div>

                        {/* Form Section */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">

                                {/* Name Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <FiUser className="text-gray-400" />
                                            <span>Full Name</span>
                                        </div>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputs}
                                        autoComplete="off"
                                        placeholder="Enter friend's name"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${errors.name ? "border-red-400 focus:ring-red-500" : "border-gray-200 focus:border-blue-400"
                                            }`}
                                    />
                                    {errors.name && (
                                        <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                                            <FiAlertCircle className="text-sm" />
                                            <span>{errors.name}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Email Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <div className="flex items-center gap-2">
                                            <FiMail className="text-gray-400" />
                                            <span>Email Address</span>
                                        </div>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputs}
                                        autoComplete="off"
                                        placeholder="friend@example.com"
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${errors.email ? "border-red-400 focus:ring-red-500" : "border-gray-200 focus:border-blue-400"
                                            }`}
                                    />
                                    {errors.email && (
                                        <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
                                            <FiAlertCircle className="text-sm" />
                                            <span>{errors.email}</span>
                                        </div>
                                    )}
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
                                            <span>Adding Friend...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiUserPlus className="text-lg" />
                                            <span>Add Friend</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Helpful Tips */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FiUsers className="text-blue-500 text-sm" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">💡 TIP</p>
                                        <p className="text-xs text-gray-400">
                                            Make sure to enter the exact name and email your friend used to register.
                                            They'll receive a friend request notification.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info Card */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-400">
                            Can't find your friend? Make sure they're registered on Real Chat
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddFriend;