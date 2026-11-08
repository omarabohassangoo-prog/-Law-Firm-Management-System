# نظام إدارة مكتب محاماة متكامل (Legal Practice ERP & Client Portal)
**نظام إلكتروني سحابي متكامل لإدارة مكاتب المحاماة والاستشارات القانونية**

مبني بأحدث تقنيات الويب: **React 18 + TypeScript + Tailwind CSS + Node.js Express + Firebase Firestore + Puppeteer + Handlebars**.

---

## 🌟 الميزات الرئيسية (Core Features)

1. **6 شاشات مصادقة كاملة وأمنية (Zero-Trust Identity):**
   - تسجيل الدخول الموحد، إنشاء الحساب، التحقق الثنائي (OTP/2FA SMS/Email)، استعادة وتعيين كلمة المرور، وتفعيل البريد.
   - حماية ضد الاختراق وبصمة المتصفح الرقمية (Device Fingerprint).
2. **6 لوحات تحكم متخصصة ومعزولة الصلاحيات (Role-Based Dashboards):**
   - مدير المكتب (Admin)
   - المحامي الممارس (Lawyer)
   - المساعد القانوني (Legal Assistant)
   - المحاسب المالي (Accountant)
   - السكرتارية والاستقبال (Secretary)
   - بوابة الموكل الإلكترونية (Client Portal)
3. **إدارة الممارسات القضائية المتكاملة:**
   - ملف القضية الشامل بـ 5 ألسنة تبويب داخلية (المستندات، الفواتير، الجلسات، الخط الزمني، والمحادثة).
   - جدول الجلسات القضائية والتقويم الذكي.
   - إدارة المهام وتوزيع العمل على الفريق.
4. **التزامن السحابي الحي مع Firebase Firestore:**
   - اشتراكات لحظية (`onSnapshot`) لمزامنة القضايا والموكلين والفواتير والمستندات لحظياً.
   - قواعد حماية مشددة (`firestore.rules`) منشورة ومعتمدة.
5. **استوديو القوالب وتوليد الـ PDF والباركود:**
   - محرك Handlebars لتوليد الإنذارات العدلية وعقود الأتعاب والمذكرات.
   - تصدير رسمي للـ PDF عبر Puppeteer مع الباركود والأرقام التسلسلية.
6. **التوقيع الإلكتروني والتوثيق الزمني المشفر:**
   - لوحة توقيع Canvas حية تدعم الشاشات اللمسية والفأرة.
   - توليد بصمة أمان `SHA-256` وختم زمني معتمد `RFC-3161 TSA`.
7. **بوابة الفحص والتدقيق الآلي لما قبل النشر (277 فحصاً):**
   - مشغل فحص آلي يغطي 10 فئات أمنية وفنية ويعتمد قرار النشر (GO Verdict).

---

## 🚀 دليل النشر على Vercel و GitHub

### الطريقة الأولى: النشر المباشر عبر Vercel Dashboard (الأسهل)

1. قم بإنشاء مستودع جديد على **GitHub** (مثلاً: `law-firm-erp`).
2. ارفع ملفات المشروع إلى GitHub باستخدام الأوامر التالية:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Production Ready LegalTech ERP"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```
3. توجه إلى موقع [Vercel](https://vercel.com) وسجل الدخول باستخدام حساب GitHub.
4. اضغط على **"Add New Project"** ثم اختر المستودع الخاص بك.
5. الإعدادات التلقائية مهيأة بالكامل عبر ملف `vercel.json`:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. في قسم **Environment Variables** أضف المتغيرات الموجودة في `.env.example` عند الحاجة.
7. اضغط على **"Deploy"**. سيتم إطلاق موقعك بنجاح خلال دقائق وتوفير رابط مجاني ومحمي بـ SSL (`.vercel.app`).

---

### الطريقة الثانية: النشر التلقائي عبر GitHub Actions (CI/CD Pipeline)

المشروع مزود بملف جاهز للتشغيل الآلي في المسار:
`.github/workflows/deploy.yml`

عند دفع الكود إلى فرع `main`، سيقوم GitHub تلقائياً بـ:
1. فحص الكود وتثبيت الحزم (`npm ci`).
2. تدقيق الأنواع بالكامل (`npm run lint`).
3. بناء نسخة الإنتاج (`npm run build`).
4. النشر الفوري إلى منصة Vercel عند إدخال الـ Secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

---

## 🛠️ التشغيل المحلي للتطوير (Local Development)

```bash
# 1. تثبيت الحزم
npm install

# 2. تشغيل السيرفر والتطبيق محلياً
npm run dev

# 3. فحص الأنواع والجودة
npm run lint

# 4. بناء نسخة الإنتاج
npm run build
```

---

## 📁 هيكلية المشروع (Project Structure)

```
├── vercel.json                 # إعدادات النشر وقواعد التوجيه لـ Vercel
├── .github/workflows/          # سير العمل الآلي للنشر التلقائي في GitHub Actions
├── server.ts                   # خادم Express و Socket.IO ومسارات API
├── firestore.rules             # قواعد الأمان السحابية المشددة
├── firebase-applet-config.json # إعدادات الاتصال بـ Firebase Firestore
├── src/
│   ├── App.tsx                 # موزع المسارات والشاشات
│   ├── store/                  # إدارة الحالة عبر Zustand ومستودعات التزامن
│   ├── lib/                    # أدوات التزامن مع Firestore
│   ├── modules/templates/      # محرك معالجة القوالب والـ PDF
│   ├── components/             # مكونات الواجهة ولوحة التوقيع
│   ├── pages/auth/             # شاشات المصادقة الست
│   ├── pages/dashboard/        # لوحات تحكم الأدوار وبوابة التدقيق
│   └── pages/shared/           # شاشات القضايا والوثائق والفواتير
└── DEVELOPMENT_PLAN.md         # وثيقة الفحص الشامل ومصفوفة الجاهزية
```

---
*تم إعداد هذا المشروع وجاهزيته للنشر التجاري والتشغيلي بنسبة 100%.*
