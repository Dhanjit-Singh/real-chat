import ChatLayout from "../Chat/ChatLayout";
import { toast, Toaster } from "react-hot-toast";


const ChatPage = () => {
    return (
        <>
            
            <div className="h-screen overflow-hidden">
                <ChatLayout />
            </div>
        </>
    );
};

export default ChatPage;
