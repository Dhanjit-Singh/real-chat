import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
    apiKey: "AIzaSyBL65bsQsRSScRKKRP5ev9Jh7Hj3zVbMlA",
    authDomain: "real-chat-7038a.firebaseapp.com",
    projectId: "real-chat-7038a",
    messagingSenderId: "1042387637315",
    appId: "1:1042387637315:web:27af360f7900e88cd830f6"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png",
  });
});