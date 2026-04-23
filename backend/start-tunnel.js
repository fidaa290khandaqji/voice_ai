const localtunnel = require('localtunnel');

(async () => {
  try {
    console.log('⏳ جاري فتح الرابط الآمن لسيرفر زينة...');
    const tunnel = await localtunnel({ port: 5000 });

    console.log('\n================================================');
    console.log('🚀 الرابط الخاص بك هو:');
    console.log(tunnel.url);
    console.log('================================================\n');
    console.log('⚠️ اترك هذه الشاشة مفتوحة لكي تستمر المكالمات بالعمل.');

    tunnel.on('close', () => {
      console.log('❌ تم إغلاق الرابط.');
    });
  } catch (err) {
    console.error('❌ خطأ أثناء فتح الرابط:', err);
    console.log('\nجرب التأكد من أنك قمت بتثبيت المكتبة عبر أمر: npm install localtunnel');
  }
})();
