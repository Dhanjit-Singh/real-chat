import { useState } from "react";
import { FiChevronDown, FiHelpCircle, FiMail, FiSearch, FiMessageCircle, FiShield, FiUsers, FiGlobe } from "react-icons/fi";

const faqs = [
    {
        question: "What is Real Chat?",
        answer: "Real Chat is a real-time messaging platform that allows users to connect, chat, and collaborate instantly with their friends or team members.",
        category: "General"
    },
    {
        question: "How do I start using Real Chat?",
        answer: "Simply sign up with your email, log in, and start adding friends. Once added, you can begin chatting instantly.",
        category: "Getting Started"
    },
    {
        question: "How can I add friends?",
        answer: "You can add friends by searching their name or email in the Add Friend section. Once found, send a request to connect.",
        category: "Friends"
    },
    {
        question: "Why can’t I find a user?",
        answer: "Make sure you are entering the correct email or name. If the user is not registered, they will not appear in search results.",
        category: "Friends"
    },
    {
        question: "How do real-time messages work?",
        answer: "Messages are delivered instantly using WebSocket technology, so you don't need to refresh the page to see new messages.",
        category: "Messaging"
    },
    {
        question: "Can I use Real Chat on mobile?",
        answer: "Yes, Real Chat is fully responsive and works smoothly on mobile browsers.",
        category: "Platform"
    },
    {
        question: "What do message statuses mean?",
        answer: "Sent means your message has been sent. Delivered means the recipient received it. Read means the recipient has opened it.",
        category: "Messaging"
    },
    {
        question: "Why are my messages not sending?",
        answer: "Check your internet connection. If the issue persists, try refreshing the page or logging in again.",
        category: "Troubleshooting"
    },
    {
        question: "Is my data secure?",
        answer: "Yes, your data is securely stored and communication is protected using modern authentication and encryption practices.",
        category: "Security"
    },
    {
        question: "Can I log out from all devices?",
        answer: "Currently, you can log out from your active session. Multi-device session control may be added in future updates.",
        category: "Account"
    },
];

const categories = ["All", "General", "Getting Started", "Friends", "Messaging", "Platform", "Troubleshooting", "Security", "Account"];

const FAQPage = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getCategoryIcon = (category) => {
        switch (category) {
            case "General": return <FiHelpCircle className="text-blue-500" />;
            case "Getting Started": return <FiMessageCircle className="text-green-500" />;
            case "Friends": return <FiUsers className="text-purple-500" />;
            case "Messaging": return <FiMessageCircle className="text-indigo-500" />;
            case "Security": return <FiShield className="text-red-500" />;
            default: return <FiHelpCircle className="text-gray-500" />;
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">

                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-blue-600 text-sm font-semibold mb-4">
                            <FiHelpCircle className="text-sm" />
                            Support Center
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Help & FAQ
                        </h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Everything you need to know about using Real Chat
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-8">
                        <div className="relative max-w-md mx-auto">
                            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                                type="text"
                                placeholder="Search your question..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                            />
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="mb-10 overflow-x-auto">
                        <div className="flex gap-2 pb-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setActiveCategory(category);
                                        setOpenIndex(null);
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeCategory === category
                                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* FAQ List */}
                    {filteredFaqs.length > 0 ? (
                        <div className="space-y-3 mb-12">
                            {filteredFaqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full flex justify-between items-center p-5 text-left hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
                                                {getCategoryIcon(faq.category)}
                                            </div>
                                            <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                                                {faq.question}
                                            </span>
                                        </div>
                                        <FiChevronDown
                                            className={`text-gray-400 transition-all duration-300 flex-shrink-0 ${openIndex === index ? "rotate-180 text-blue-500" : ""
                                                }`}
                                        />
                                    </button>

                                    <div
                                        className={`px-5 pb-5 pt-0 text-gray-600 text-sm md:text-base leading-relaxed border-t border-gray-100 transition-all duration-300 ${openIndex === index ? "block" : "hidden"
                                            }`}
                                    >
                                        <div className="pt-4">
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm mb-12">
                            <FiHelpCircle className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No questions found</p>
                            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or category filter</p>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="grid md:grid-cols-3 gap-4 mb-12">
                        {[
                            { icon: FiMessageCircle, title: "Getting Started", desc: "New to Real Chat?", link: "#" },
                            { icon: FiShield, title: "Privacy & Security", desc: "Learn how we protect you", link: "#" },
                            { icon: FiGlobe, title: "Mobile App", desc: "Use on your phone", link: "#" }
                        ].map((item, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm p-5 text-center hover:shadow-md transition-all duration-200 border border-gray-100">
                                <item.icon className="text-2xl text-blue-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                                <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Support Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-center">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                            Still have questions?
                        </h3>
                        <p className="text-white/90 text-sm mb-6">
                            Can't find what you're looking for? Our support team is here to help!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-md">
                                <FiMail />
                                Contact Support
                            </button>
                            <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 border border-white/30">
                                <FiMessageCircle />
                                Live Chat
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-10">
                        <p className="text-gray-400 text-sm">
                            Updated regularly • Last updated: March 2026
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FAQPage;