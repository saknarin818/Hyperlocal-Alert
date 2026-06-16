# Hyperlocal Alert 🚨

Hyperlocal Alert เป็นเว็บแอปพลิเคชันที่ออกแบบมาเพื่อการรายงาน ตรวจสอบ และแจ้งเตือนเหตุการณ์ต่างๆ ในระดับพื้นที่ (Hyperlocal) แบบเรียลไทม์ พัฒนาด้วย **React** และ **TypeScript** โดยทำงานร่วมกับระบบ Backend และฐานข้อมูลของ **Firebase** พร้อมทั้งมีระบบ Dashboard สำหรับผู้ดูแลระบบเพื่อจัดการข้อมูลอย่างเป็นระเบียบ

---

## 🚀 ฟีเจอร์หลัก (Key Features)

- **User Authentication:** รองรับระบบเข้าสู่ระบบ (Login), สมัครสมาชิก (Register), ลืมรหัสผ่าน (Forgot Password) และหน้าจัดการโปรไฟล์ผู้ใช้งาน
- **Incident Management:** ผู้ใช้สามารถรายงานเหตุการณ์ที่เกิดขึ้นในพื้นที่ได้ผ่านหน้า Report Incident
- **Real-time Map & Data Visualization:**
  - ดูเหตุการณ์ที่เกิดขึ้นบนแผนที่แบบ Interactive (`EventMapDialog`)
  - ดูกราฟสถิติเหตุการณ์ (`IncidentsChart`)
  - ดูรายการเหตุการณ์ล่าสุดพร้อมตัวกรองเวลา (`LatestIncidents`, `TimeFilter`, `EventFilter`)
- **Push Notifications:** มีระบบแจ้งเตือนข่าวสารแบบพุช (Push Notifications) โดยทำงานผ่าน Firebase Cloud Messaging (FCM) และ Service Worker
- **Admin Dashboard:** พื้นที่เฉพาะสำหรับผู้ดูแลระบบ เพื่อจัดการบัญชีผู้ใช้งาน, ตารางเหตุการณ์, และประเภทของเหตุการณ์ต่างๆ
- **Route Protection:** ระบบจำกัดสิทธิ์การเข้าถึงหน้าเว็บ (Private/Protected Routes) สำหรับผู้ใช้งานที่ล็อกอินแล้วและผู้ดูแลระบบ

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:** React, TypeScript, React Router
- **Backend & Services (Firebase):**
  - Firebase Authentication
  - Firestore / Realtime Database
  - Firebase Cloud Messaging (FCM) สำหรับ Web Push Notifications
  - Firebase Cloud Functions สำหรับประมวลผล API เบื้องหลัง
  - Firebase Hosting สำหรับการนำระบบขึ้นใช้งานจริง

---
## ⚙️ ขั้นตอนการติดตั้งและรันโปรเจกต์ (Installation & Setup)

กรุณาตรวจสอบให้แน่ใจว่าในเครื่องของคุณมีการติดตั้ง **Node.js** และ **Firebase CLI** เรียบร้อยแล้ว

### 1. Clone โปรเจกต์ลงมาที่เครื่องของคุณ

```bash
git clone https://github.com/saknarin818/hyperlocal-alert.git
cd hyperlocal-alert
```

### 2. ติดตั้ง Dependencies ของ Frontend

```bash
npm install
```

### 3. ติดตั้ง Dependencies ของ Firebase Functions

ฟังก์ชันการทำงานเบื้องหลังอยู่ในโฟลเดอร์ `functions`

```bash
cd functions
npm install
cd ..
```

### 4. ตั้งค่า Environment Variables

แก้ไขไฟล์ `.env` ที่โฟลเดอร์หลัก และใส่ข้อมูล Configuration ของ Firebase รวมถึง VAPID Key สำหรับการแจ้งเตือน

```env
REACT_APP_VAPID_KEY=your_vapid_key_here
```

เพิ่มค่า Firebase Configuration อื่น ๆ ตามที่กำหนดไว้ในไฟล์ `src/firebase.ts`

### 5. เริ่มต้นการทำงาน (Run Locally)

```bash
npm start
```

แอปพลิเคชันจะรันขึ้นมาที่:

```text
http://localhost:3000
```

### 6. การทดสอบ Firebase Functions แบบ Local (Optional)

หากต้องการทดสอบ Cloud Functions ในเครื่อง ให้เปิดเทอร์มินัลใหม่แล้วรัน:

```bash
firebase emulators:start
```

---

## 📂 โครงสร้างโฟลเดอร์ที่สำคัญ (Project Structure)

* `/src/components/` - คอมโพเนนต์ที่ใช้ซ้ำได้ เช่น Navbar, EventCard, Maps และ Charts
* `/src/components/admin/` - คอมโพเนนต์สำหรับระบบหลังบ้าน (Admin Dashboard)
* `/src/pages/` - หน้าต่าง ๆ ของแอปพลิเคชัน เช่น Home, Login, Register และ Report Incident
* `/src/context/` - การจัดการ State ส่วนกลาง เช่น `AuthContext`
* `/functions/` - Firebase Cloud Functions ที่พัฒนาด้วย TypeScript
* `/public/` - Static Assets และ `firebase-messaging-sw.js` สำหรับ Push Notifications

---

## 📄 License

โปรเจกต์นี้เป็น Open Source ภายใต้ลิขสิทธิ์ MIT License
