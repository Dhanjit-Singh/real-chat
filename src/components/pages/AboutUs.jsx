import { FiMessageCircle, FiUsers, FiShield, FiArrowRight, FiCheckCircle, FiHeart, FiGlobe, FiZap } from "react-icons/fi";

const AboutUs = () => {
    return (
        <>
            {/* Hero Section with Gradient Background */}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">

                    {/* Header with Animation */}
                    <div className="text-center mb-16">
                        <div className="inline-block px-3 py-1 bg-blue-100 rounded-full text-blue-600 text-sm font-semibold mb-4">
                            Welcome to Real Chat
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            About Real Chat
                        </h1>
                        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
                            Connecting people with fast, simple, and real-time communication
                        </p>
                    </div>

                    {/* Intro Card with Hover Effect */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-12 transform hover:scale-[1.02] transition-all duration-300 border border-gray-100">
                        <p className="text-gray-700 leading-relaxed text-base md:text-lg text-center">
                            Real Chat is a modern real-time messaging platform designed to make
                            communication seamless and efficient. Whether you're chatting with
                            friends or collaborating with your team, Real Chat provides a smooth
                            and reliable experience.
                        </p>
                    </div>

                    {/* Features with Modern Cards */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {/* Real-Time Messaging */}
                        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                                <FiMessageCircle className="text-white text-3xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                Real-Time Messaging
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Send and receive messages instantly without refreshing the page. Powered by WebSocket technology.
                            </p>
                            <div className="mt-4 flex items-center justify-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-sm font-medium">Learn more</span>
                                <FiArrowRight className="ml-1 text-sm" />
                            </div>
                        </div>

                        {/* Friend System */}
                        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center border border-gray-100 hover:border-emerald-200 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                                <FiUsers className="text-white text-3xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                Friend System
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Add and manage your own chat list just like modern messaging apps. Stay connected with your circle.
                            </p>
                            <div className="mt-4 flex items-center justify-center text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-sm font-medium">Learn more</span>
                                <FiArrowRight className="ml-1 text-sm" />
                            </div>
                        </div>

                        {/* Secure & Reliable */}
                        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center border border-gray-100 hover:border-purple-200 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                                <FiShield className="text-white text-3xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                Secure & Reliable
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Built with secure authentication and stable backend services. Your data is always protected.
                            </p>
                            <div className="mt-4 flex items-center justify-center text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-sm font-medium">Learn more</span>
                                <FiArrowRight className="ml-1 text-sm" />
                            </div>
                        </div>
                    </div>

                    {/* How It Works Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 md:p-12 mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
                            How It Works
                        </h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            {[
                                { step: "01", title: "Sign Up", desc: "Create your account in seconds", icon: FiCheckCircle },
                                { step: "02", title: "Add Friends", desc: "Connect with people you know", icon: FiUsers },
                                { step: "03", title: "Start Chatting", desc: "Send messages instantly", icon: FiMessageCircle },
                                { step: "04", title: "Stay Connected", desc: "Chat anytime, anywhere", icon: FiGlobe }
                            ].map((item, index) => (
                                <div key={index} className="text-center text-white">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                        <item.icon className="text-xl" />
                                    </div>
                                    <div className="text-2xl font-bold mb-2">{item.step}</div>
                                    <div className="font-semibold mb-1">{item.title}</div>
                                    <div className="text-sm text-white/80">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                        {[
                            { value: "10K+", label: "Active Users", icon: FiUsers },
                            { value: "1M+", label: "Messages Sent", icon: FiMessageCircle },
                            { value: "99.9%", label: "Uptime", icon: FiZap },
                            { value: "24/7", label: "Support", icon: FiHeart }
                        ].map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                <stat.icon className="text-blue-600 text-2xl mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                                <div className="text-sm text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="text-center">
                        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                                Ready to get started?
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Join thousands of users who trust Real Chat for their daily communication
                            </p>
                            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                Get Started Now
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-12 pt-8 border-t border-gray-200">
                        <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                            Built with <FiHeart className="text-red-500 text-sm animate-pulse" /> for seamless communication
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AboutUs;