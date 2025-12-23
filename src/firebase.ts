import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

// TODO: ใส่ค่า Firebase Config ของคุณที่นี่
// คุณสามารถหาค่าเหล่านี้ได้จากหน้า Project Settings ใน Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBxnJbFo_HzEiT4gzwYGBhDc9arn24iP_w",
  authDomain: "hyperlocal-alert.firebaseapp.com",
  projectId: "hyperlocal-alert",
  storageBucket: "hyperlocal-alert.firebasestorage.app",
  messagingSenderId: "130077592040",
  appId: "1:130077592040:web:4dad72b79cf116f4263c5d",
  measurementId: "G-1C96GCZ3FL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore instance เพื่อนำไปใช้ในหน้าอื่นๆ
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app); // <-- export messaging