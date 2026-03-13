import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// 👉 นำเข้าฟังก์ชันสำหรับขอสิทธิ์แจ้งเตือน
import { registerForPush, unregisterAllTokens } from "../pushNotifications"; 

type AuthContextType = {
  user: User | null;
  role: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let onlineInterval: NodeJS.Timeout; 

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const userDocRef = doc(db, "users", u.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setRole(userDocSnap.data().role);
          } else {
            setRole("user");
          }

          // อัปเดตเวลาออนไลน์ทันทีที่ล็อกอินเสร็จ
          try {
            await updateDoc(userDocRef, { lastOnline: serverTimestamp() });
          } catch (updateErr) {
            console.error("ไม่สามารถอัปเดตสถานะออนไลน์ครั้งแรกได้:", updateErr);
          }

          // 👉 2. ทันทีที่ล็อกอินหรือสมัครเสร็จ ให้ระบบเด้งหน้าต่าง "ขอความยินยอม (Consent)"
          try {
            const token = await registerForPush();
            if (token) {
              console.log("ตั้งค่าและรับการแจ้งเตือนสำเร็จ Token:", token);
            } else {
              console.log("ผู้ใช้กดยกเลิก ไม่ยินยอมรับการแจ้งเตือน");
            }
          } catch (pushErr) {
            console.error("เกิดข้อผิดพลาดในการขอสิทธิ์แจ้งเตือน หรือ Browser ไม่รองรับ:", pushErr);
          }

          // ตั้งเวลาอัปเดตสถานะ "ออนไลน์" ทุกๆ 3 นาที
          onlineInterval = setInterval(async () => {
            try {
              await updateDoc(userDocRef, { lastOnline: serverTimestamp() });
            } catch (intervalErr) {
              console.error("ไม่สามารถอัปเดตสถานะออนไลน์รายรอบได้:", intervalErr);
            }
          }, 180000);

        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole("user");
        }
      } else {
        // 🔴 กรณีล็อกเอาท์ - ลบ token ทั้งหมด
        setUser(null);
        setRole(null);
        
        // 🔔 ลบ FCM token ทั้งหมด
        try {
          await unregisterAllTokens();
        } catch (err) {
          console.error("Error unregistering tokens on logout:", err);
        }
        
        if (onlineInterval) clearInterval(onlineInterval); 
      }
      setLoading(false);
    });
    
    return () => {
      unsub();
      if (onlineInterval) clearInterval(onlineInterval); 
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};