import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBL65bsQsRSScRKKRP5ev9Jh7Hj3zVbMlA",
    authDomain: "real-chat-7038a.firebaseapp.com",
    projectId: "real-chat-7038a",
    storageBucket: "real-chat-7038a.firebasestorage.app",
    messagingSenderId: "1042387637315",
    appId: "1:1042387637315:web:27af360f7900e88cd830f6"
};

const app = initializeApp(firebaseConfig);


export const messaging = getMessaging(app);
export { getToken, onMessage };