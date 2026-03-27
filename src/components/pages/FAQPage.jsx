import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const faqs = [
    {
        question: "What is Real Chat?",
        answer:
            "Real Chat is a real-time messaging platform that allows users to connect, chat, and collaborate instantly with their friends or team members.",
    },
    {
        question: "How do I start using Real Chat?",
        answer:
            "Simply sign up with your email, log in, and start adding friends. Once added, you can begin chatting instantly.",
    },
    {
        question: "How can I add friends?",
        answer:
            "You can add friends by searching their name or email in the Add Friend section. Once found, send a request to connect.",
    },
    {
        question: "Why can’t I find a user?",
        answer:
            "Make sure you are entering the correct email or name. If the user is not registered, they will not appear in search results.",
    },
    {
        question: "How do real-time messages work?",
        answer:
            "Messages are delivered instantly using WebSocket technology, so you don’t need to refresh the page to see new messages.",
    },
    {
        question: "Can I use Real Chat on mobile?",
        answer:
            "Yes, Real Chat is fully responsive and works smoothly on mobile browsers.",
    },
    {
        question: "What do message statuses mean?",
        answer:
            "Sent means your message has been sent. Delivered means the recipient received it. Read means the recipient has opened it.",
    },
    {
        question: "Why are my messages not sending?",
        answer:
            "Check your internet connection. If the issue persists, try refreshing the page or logging in again.",
    },
    {
        question: "Is my data secure?",
        answer:
            "Yes, your data is securely stored and communication is protected using modern authentication and encryption practices.",
    },
    {
        question: "Can I log out from all devices?",
        answer:
            "Currently, you can log out from your active session. Multi-device session control may be added in future updates.",
    },
];

const FAQPage = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <>
            <div className="min-h-screen items-center justify-center bg-gray-100 pt-8">
                <div className="min-h-screen bg-gray-50 px-4 py-10">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
                            Help & FAQ
                        </h1>
                        <p className="text-center text-gray-500 mb-8">
                            Everything you need to know about using Real Chat
                        </p>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl shadow-sm border"
                                >
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full flex justify-between items-center p-4 text-left"
                                    >
                                        <span className="font-medium text-gray-800">
                                            {faq.question}
                                        </span>
                                        <FiChevronDown
                                            className={`transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""
                                                }`}
                                        />
                                    </button>

                                    <div
                                        className={`px-4 pb-4 text-gray-600 text-sm md:text-base transition-all duration-300 ${openIndex === index ? "block" : "hidden"
                                            }`}
                                    >
                                        {faq.answer}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 text-center text-gray-400 text-sm">
                            Still have questions? Contact support.
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FAQPage;