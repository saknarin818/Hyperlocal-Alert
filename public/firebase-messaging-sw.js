// filepath: c:\Users\sakna\Desktop\Project\hyperlocal-alert\public\firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBxnJbFo_HzEiT4gzwYGBhDc9arn24iP_w",
  authDomain: "hyperlocal-alert.firebaseapp.com",
  projectId: "hyperlocal-alert",
  storageBucket: "hyperlocal-alert.firebasestorage.app",
  messagingSenderId: "130077592040",
  appId: "1:130077592040:web:4dad72b79cf116f4263c5d",
  measurementId: "G-1C96GCZ3FL"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || "แจ้งเตือนใหม่";
  const notificationOptions = {
    body: payload.notification?.body || "มีเหตุการณ์ใหม่",
    icon: payload.notification?.icon || '/favicon.ico',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});