importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyBL65bsQsRSScRKKRP5ev9Jh7Hj3zVbMlA",
  authDomain: "real-chat-7038a.firebaseapp.com",
  projectId: "real-chat-7038a",
  messagingSenderId: "1042387637315",
  appId: "1:1042387637315:web:27af360f7900e88cd830f6",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Background message:", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png",
  });
});

self.addEventListener("push", function (event) {
  console.log("Push received:", event);
  if (!event.data) return;

  const data = event.data.json();

  self.registration.showNotification(data.notification.title, {
    body: data.notification.body,
    icon: "/logo192.png",
  });
});