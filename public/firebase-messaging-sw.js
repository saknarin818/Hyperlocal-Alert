/* eslint-disable no-restricted-globals */
/* eslint-env serviceworker */
/* global importScripts, firebase */
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
    data: payload.data || {},
    tag: 'hyperlocal-alert', // ป้องกัน duplicate notification
    requireInteraction: false
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 🔥 ฟังก์ชันจัดการเมื่อ user click notification
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event.notification);
  
  event.notification.close();
  
  const incidentId = event.notification.data?.incidentId;
  const eventId = event.notification.data?.eventId;
  
  let targetUrl = '/event'; // URL default
  
  if (incidentId) {
    targetUrl = `/event?id=${incidentId}`;
  } else if (eventId) {
    targetUrl = `/event?id=${eventId}`;
  }
  
  // ค้นหาหน้าต่างที่เปิดอยู่
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // ตรวจสอบว่าเปิดอยู่แล้วหรือไม่
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus();
          }
        }
        // ถ้าไม่มี ให้เปิดใหม่
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// 🔥 ฟังก์ชันจัดการเมื่อปิด notification
self.addEventListener('notificationclose', function(event) {
  console.log('[firebase-messaging-sw.js] Notification closed:', event.notification);
});