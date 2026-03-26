import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "../../../api/api";
import { useAuth } from "../../../context/AuthContext";
import { toast, Toaster } from "react-hot-toast";


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
            <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-center mb-6">
                        Add Friend
                    </h1>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputs}
                                autoComplete="new-name"
                                placeholder="Enter your name"
                                className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            {errors.name && <p className="text-red-500">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputs}
                                autoComplete="new-email"
                                placeholder="Enter your email"
                                className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            {errors.email && <p className="text-red-500">{errors.email}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                            Add
                            {isLoading && (
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddFriend;