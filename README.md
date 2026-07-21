# 🛍️ Modern Store - متجر متكامل مع لوحة تحكم وإدارة طلبات عبر الواتساب

متجر إلكتروني عصري ومتكامل مصمم باستخدام **React 18 + TypeScript + Vite + Tailwind CSS** مع قاعدة بيانات **Supabase** وإدارة حالة باستخدام **Zustand**.

---

## ✨ المميزات الرئيسية

- 🎨 **تصميم عصري وجذاب:** يدعم الاتجاه من اليمين إلى اليسار (RTL) مع تجربة مستخدم سلسة واستجابة كاملة لكافة الشاشات (Mobile & Desktop).
- 👕 **خيارات المنتجات والملابس:** دعم اختيار مقاسات وألوان متعددة للمنتجات مع معرض صور تفاعلي (Image Gallery).
- 📱 **إرسال الطلبات عبر الواتساب:** إمكانية توجيه العميل بعد إتمام الطلب إلى تطبيق الواتساب مباشرةً مع رسالة مجهزة ومكتوبة تحتوي على كافة تفاصيل الطلب.
- 🔔 **نظام تنبيهات وإشعارات مخصص (Custom Toasts & Modals):** التخلص التام من رسائل المتصفح الافتراضية واستبدالها بواجهات تنبيهات عصرية وأنيقة.
- 📊 **لوحة تحكم كاملة للمدير (Admin Dashboard):**
  - إدارة المنتجات (إضافة، تعديل، حذف، رفع صور متعددة، تحديد مقاسات وألوان).
  - متابعة وتعديل حالة الطلبات (جديد، قيد المعالجة، مكتمل، ملغي) وحذف الطلبات.
  - إدارة الأقسام (Categories).
  - إدارة الودجات والواجهات الجانبية (Sidebar Widgets) مع دعم **السحب والإفلات (Drag & Drop)** لإعادة الترتيب.
  - إعدادات متكاملة للمتجر (اسم المتجر، رقم التواصل، رقم الواتساب، نصوص الصفحات التعريفية، وتغيير كلمة المرور).

---

## 🛠️ التقنيات المستخدمة

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide React Icons
- **State Management:** Zustand
- **Backend & Database:** Supabase (PostgreSQL, Authentication, Row Level Security)
- **Routing:** React Router v6

---

## 🚀 طريقة التشغيل والتهيئة المحلية

### 1. استنساخ المشروع وتثبيت الحزم
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.NET.git
cd ModernStore
npm install
```

### 2. إعداد متغيرات البيئة (Environment Variables)
قم بإنشاء ملف `.env` في المجلد الرئيسي للمشروع وإضافة بيانات الاتصال بـ Supabase:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. إعداد قاعدة البيانات على Supabase
1. قم بإنشاء مشروع جديد على موقع [Supabase](https://supabase.com/).
2. توجه إلى قسم **SQL Editor** في لوحة تحكم Supabase.
3. افتح الملف `supabase/full_schema.sql` من هذا المشروع، انسخ محتواه، وقم بتشغيله (Run).

### 4. تشغيل سيرفر التطوير
```bash
npm run dev
```

---

## 📜 الترخيص (License)

هذا المشروع مفتوح المصدر ومتاح للاستخدام تحت رخصة [MIT License](LICENSE).
