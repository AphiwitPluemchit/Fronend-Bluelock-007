# 🔐 Google OAuth Testing Guide

## ✅ **Implementation Complete!**

เราได้เพิ่ม Google OAuth login ใน frontend แล้ว โดยไม่ได้ลบ login เดิมออก

## 🎯 **What's Added:**

### **1. LoginPage Updates**
- ✅ เพิ่มปุ่ม "เข้าสู่ระบบด้วย Google" 
- ✅ เพิ่ม divider "หรือ" ระหว่างปุ่ม
- ✅ รองรับทั้ง Desktop และ Mobile layout
- ✅ Google-style button design

### **2. New Components**
- ✅ `GoogleCallback.vue` - หน้าสำหรับรับ token จาก Google
- ✅ Route `/auth/callback` สำหรับ Google OAuth callback

### **3. Auth Store Updates**
- ✅ เพิ่ม `loginWithToken()` method สำหรับ Google OAuth
- ✅ รองรับการ decode JWT token
- ✅ เก็บ user data จาก Google OAuth

## 🧪 **Testing Methods:**

### **Method 1: Frontend Integration Test (Recommended)**
1. เปิด frontend development server:
   ```bash
   cd Fronend-Bluelock-007
   npm run dev
   # หรือ
   quasar dev
   ```

2. ไปที่ `http://localhost:9000` (หรือ port ที่ frontend รัน)

3. ในหน้า Login จะเห็นปุ่ม "เข้าสู่ระบบด้วย Google"

4. คลิกปุ่มนั้นเพื่อทดสอบ Google OAuth flow

### **Method 2: HTML Test Page**
1. เปิดไฟล์ `test-google-auth.html` ในเบราว์เซอร์:
   ```
   file:///path/to/Fronend-Bluelock-007/test-google-auth.html
   ```

2. ทดสอบ backend connection และ Google OAuth URL generation

3. คลิก "เข้าสู่ระบบด้วย Google" เพื่อทดสอบ flow

### **Method 3: Direct Backend Test**
1. เปิด `Backend-Bluelock-007/test_google_auth.html` ในเบราว์เซอร์

2. ทดสอบ backend endpoints โดยตรง

## 🔄 **OAuth Flow:**

```
1. User clicks "เข้าสู่ระบบด้วย Google"
   ↓
2. Frontend calls: GET /auth/google
   ↓
3. Backend returns Google OAuth URL
   ↓
4. Frontend redirects to Google
   ↓
5. User authenticates with Google
   ↓
6. Google redirects to: /auth/google/redirect
   ↓
7. Backend processes OAuth code
   ↓
8. Backend redirects to: /auth/callback?token=...
   ↓
9. Frontend GoogleCallback.vue processes token
   ↓
10. User is logged in and redirected to dashboard
```

## 🎯 **Expected Results:**

### **✅ Successful Login:**
- User เข้าสู่ระบบด้วย university email (@student.chula.ac.th หรือ @chula.ac.th)
- ระบบสร้าง user account ใหม่ (ถ้ายังไม่มี)
- User ได้รับ JWT token
- Redirect ไปหน้า dashboard ตาม role

### **❌ Expected Errors:**
- **"Only university email addresses are allowed"** - ถ้าใช้ email ที่ไม่ใช่มหาลัย
- **"Access denied"** - ถ้า user ยกเลิกการ login
- **CORS errors** - ถ้า backend ไม่ได้รัน หรือ CORS ไม่ถูกต้อง

## 🔧 **Troubleshooting:**

### **1. CORS Issues:**
```bash
# ตรวจสอบ ALLOWED_ORIGINS ใน .env
ALLOWED_ORIGINS=http://localhost:9000
```

### **2. Backend Not Running:**
```bash
cd Backend-Bluelock-007
go run ./src
```

### **3. Frontend Not Running:**
```bash
cd Fronend-Bluelock-007
npm run dev
```

### **4. Google Console Setup:**
- ตรวจสอบ GOOGLE_CLIENT_ID และ GOOGLE_CLIENT_SECRET
- ตรวจสอบ Authorized redirect URIs ใน Google Console:
  - `http://localhost:8888/auth/google/redirect`

## 📱 **Mobile Testing:**
- ทดสอบบน mobile browser
- ตรวจสอบ responsive design
- ทดสอบ Google OAuth บน mobile

## 🔍 **Debug Information:**
- เปิด Browser DevTools → Console เพื่อดู logs
- ตรวจสอบ Network tab สำหรับ API calls
- ดู localStorage สำหรับ token และ user data

## 🚀 **Next Steps:**
1. ทดสอบ Google OAuth flow
2. ตรวจสอบ user creation ใน database
3. ทดสอบ role-based redirects
4. ทดสอบ token validation
5. ทดสอบ logout functionality

## 📝 **Notes:**
- Google OAuth ต้องใช้ HTTPS ใน production
- ใน development สามารถใช้ localhost ได้
- Token จะ expire ตาม JWT_EXPIRY setting
- User data จะถูกเก็บใน MongoDB collections: Users, Students, Admins