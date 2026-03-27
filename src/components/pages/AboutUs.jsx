
import { FiMessageCircle, FiUsers, FiShield } from "react-icons/fi";

const AboutUs = () => {
    return (
        <>
            <div className="min-h-screen items-center justify-center bg-gray-100 pt-8">
                <div className="min-h-screen bg-gray-50 px-4 py-10">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <h1 className="text-3xl md:text-4xl font-bold mb-3">
                                About Real Chat
                            </h1>
                            <p className="text-gray-500 text-sm md:text-base">
                                Connecting people with fast, simple, and real-time communication
                            </p>
                        </div>

                        {/* Intro */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                                Real Chat is a modern real-time messaging platform designed to make
                                communication seamless and efficient. Whether you are chatting with
                                friends or collaborating with your team, Real Chat provides a smooth
                                and reliable experience.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid md:grid-cols-3 gap-6 mb-10">
                            <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
                                <FiMessageCircle className="mx-auto text-2xl mb-3" />
                                <h3 className="font-semibold mb-2">Real-Time Messaging</h3>
                                <p className="text-gray-500 text-sm">
                                    Send and receive messages instantly without refreshing the page.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
                                <FiUsers className="mx-auto text-2xl mb-3" />
                                <h3 className="font-semibold mb-2">Friend System</h3>
                                <p className="text-gray-500 text-sm">
                                    Add and manage your own chat list just like modern messaging apps.
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
                                <FiShield className="mx-auto text-2xl mb-3" />
                                <h3 className="font-semibold mb-2">Secure & Reliable</h3>
                                <p className="text-gray-500 text-sm">
                                    Built with secure authentication and stable backend services.
                                </p>
                            </div>
                        </div>

                        {/* How it works */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 mb-10">
                            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
                            <ul className="space-y-2 text-gray-600 text-sm md:text-base">
                                <li>• Sign up and create your account</li>
                                <li>• Add friends using name or email</li>
                                <li>• Start real-time conversations instantly</li>
                                <li>• Stay connected anytime, anywhere</li>
                            </ul>
                        </div>

                        {/* Footer */}
                        <div className="text-center text-gray-400 text-sm">
                            Built with ❤️ for seamless communication
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AboutUs;