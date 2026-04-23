# Smart Voice Reception AI - Backend

هذا هو المحرك البرمجي لنظام الاستقبال الذكي، مبني باستخدام Node.js و Express و MongoDB.

## الهيكلية البرمجية (Project Structure)

```text
backend/
├── api/
│   └── voice/
│       ├── incoming.js     # استقبال المكالمات الأولية
│       └── gather.js       # معالجة كلام الزبون والرد عليه
├── lib/
│   ├── claude.js       # الربط مع Anthropic Claude
│   ├── prompts.js      # صياغة الشخصية (Prompt Engineering)
│   └── storage.js      # الربط مع قاعدة البيانات MongoDB
├── server.js           # المدخل الرئيسي للسيرفر والـ WebSockets
├── package.json        # المكتبات المستخدمة
└── .env.example        # الإعدادات المطلوبة
```

## طريقة التشغيل
1. تأكد من تثبيت Node.js.
2. قم بتثبيت المكتبات: `npm install`.
3. قم بتهيئة ملف `.env` بمفاتيح الـ API الخاصة بك.
4. شغل السيرفر: `npm run dev`.

## ميزات النظام
- **AI Receptionist**: ردود ذكية بلهجة فلسطينية.
- **Sentiment Analysis**: تحليل مشاعر الزبون (سعيد/غاضب).
- **Real-time Dashboard**: تحديث لوحة التحكم لحظياً عبر WebSockets.
- **Order Automation**: تسجيل الطلبات تلقائياً في قاعدة البيانات.
