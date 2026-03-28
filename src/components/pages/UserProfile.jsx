import { useState, useEffect } from "react";
import { FiMail, FiMapPin, FiCalendar, FiEdit2, FiShare2, FiCamera, FiSettings, FiHeart, FiMessageCircle, FiUsers } from "react-icons/fi";
import api from "../../api/api";
import { FaUserTie } from "react-icons/fa";
import { useLocation } from 'react-router-dom';


const UserProfile = () => {

    const location = useLocation();
    const { user } = location.state || {};
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "",
        email: "",
        lastSeen: ""
    });

    const fetchUser = async () => {
        try {
            const response = await api.get(`/api/users/get-user/${user?._id}`);
            if (response.data.status === true) {
                setProfileData(response.data.data);
            }
        } catch (error) {
            console.log("Error fetching user", error);
        }
    }
    useEffect(() => {

        if (user?._id) {
            fetchUser();
        }
    }, [user?._id]);

    const [editedData, setEditedData] = useState(profileData);

    const handleEdit = () => {
        if (isEditing) {
            setProfileData(editedData);
        }
        setIsEditing(!isEditing);
    };

    const handleCancel = () => {
        setEditedData(profileData);
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 mt-10">
            <div className="max-w-2xl mx-auto">

                {/* Card Container */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                    {/* Header with Gradient - Consistent with other pages */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 relative">
                        <button className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition-all duration-200">
                            <FiCamera className="text-white text-sm" />
                        </button>
                    </div>

                    {/* Profile Image - Overlapping */}
                    <div className="relative flex justify-center -mt-16 mb-6">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center border-4 border-white shadow-lg">
                                <span className="text-white text-3xl font-bold">
                                    {profileData.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            {/* Online Status Badge */}
                            <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>

                            {/* Edit Avatar Overlay */}
                            <button className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                                <FiCamera className="text-white text-xl" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-8">

                        {/* Name and Title */}
                        <div className="text-center mb-6">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        name="name"
                                        value={editedData.name}
                                        onChange={handleChange}
                                        className="text-2xl font-bold text-center border-2 border-gray-200 rounded-lg px-3 py-1 focus:border-blue-400 focus:outline-none"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                                </>
                            )}
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="text-center group cursor-pointer">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-100 transition-all duration-200">
                                    <FiMessageCircle className="text-blue-500 text-lg" />
                                </div>
                                <div className="text-xl font-bold text-gray-800">{profileData.posts}</div>
                                <div className="text-xs text-gray-500">Posts</div>
                            </div>
                            <div className="text-center group cursor-pointer">
                                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-purple-100 transition-all duration-200">
                                    <FiUsers className="text-purple-500 text-lg" />
                                </div>
                                <div className="text-xl font-bold text-gray-800">{profileData.followers}</div>
                                <div className="text-xs text-gray-500">Followers</div>
                            </div>
                            <div className="text-center group cursor-pointer">
                                <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-pink-100 transition-all duration-200">
                                    <FiHeart className="text-pink-500 text-lg" />
                                </div>
                                <div className="text-xl font-bold text-gray-800">{profileData.following}</div>
                                <div className="text-xs text-gray-500">Following</div>
                            </div>
                        </div>

                        {/* Profile Details - Modern Cards */}
                        <div className="space-y-3">

                            {/* Name Card */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-all duration-200 group cursor-pointer">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-all duration-200">
                                    <FaUserTie className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={editedData.name}
                                            onChange={handleChange}
                                            className="text-gray-800 font-medium bg-transparent border-b-2 border-gray-200 focus:border-blue-400 outline-none"
                                        />
                                    ) : (
                                        <p className="text-gray-800 font-medium">{profileData.name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email Card */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-200 group cursor-pointer">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-all duration-200">
                                    <FiMail className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={editedData.email}
                                            onChange={handleChange}
                                            className="text-gray-800 font-medium bg-transparent border-b-2 border-gray-200 focus:border-blue-400 outline-none"
                                        />
                                    ) : (
                                        <p className="text-gray-800 font-medium">{profileData.email}</p>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 space-y-3">
                            {isEditing ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleEdit}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={handleEdit}
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <FiEdit2 className="text-lg" />
                                        Edit Profile
                                    </button>
                                    <button className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2">
                                        <FiShare2 className="text-lg" />
                                        Share Profile
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Settings Link */}
                        <div className="mt-6 text-center">
                            <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200 flex items-center justify-center gap-1 mx-auto">
                                <FiSettings className="text-sm" />
                                Account Settings
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;