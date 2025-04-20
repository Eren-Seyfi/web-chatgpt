import { createChatGPT } from "./index.js";
import { logInfo, logSuccess, logError } from "./lib/utils/logger.js";

// Ana işlem fonksiyonu
const run = async () => {
  try {
    // 🔧 GPT sistemi başlatılıyor
    const gpt = await createChatGPT({
      // 💡 Kullanılacak model (gpt-4, gpt-3.5 gibi)
      model: "gpt-4",

      // 🖥️ Headless false: Tarayıcı arayüzü açık (gözlemlenebilir)
      headless: false,

      // 🌐 Tarayıcı dili Türkçe (ChatGPT Türkçe arayüz açar)
      language: "tr-TR",

      // 🕵️‍♂️ Stealth modu aktif (bot tespitini engellemek için)
      stealth: true,

      // 🧬 Fake navigator.language, fingerprint taklidi yapılacak mı?
      fingerprint: true,

      // 🌍 Proxy yapılandırması
      proxy: {
        enabled: false, // false: proxy kapalı
        server: "", // proxy adresi (örnek: "http://127.0.0.1:8000")
      },

      // 📁 Oturum çerezi yolu (varsayılan: sessions/cookies.json)
      // cookiePath: "sessions/cookies.json"
    });

    // 🎯 1. Chat özelliği
    const chatResponses = await gpt.chat([
      "Merhaba! Nasılsın?",
      "Bana komik bir fıkra anlatır mısın?",
    ]);

    chatResponses.forEach((res, i) => {
      logInfo(`\n📨 Soru ${i + 1}: ${res.prompt}`);
      logSuccess(`🧠 Cevap:\n${res.content}`);
    });

    // 🎯 2. Tek görsel oluştur ve indir (image)
    await gpt.image("ışıklı camdan yapılmış bir ayıcık", "bear.png");

    // 🎯 3. Görseli base64 olarak al
    const base64 = await gpt.imageBase64(
      "mor sisli bir ormanda yüzen kristal kelebek"
    );
    console.log("📷 Base64 (ilk 100 karakter):", base64.slice(0, 100) + "...");

    // 🎯 4. Sıralı görsel üretim (queueImage) + retry + backoff + fallback
    await gpt.queueImage([
      {
        prompt: "neon ayıcık",
        output: "neon-bear.png",
        retry: 3, // Maksimum 3 deneme
        retryDelay: 2000, // 2 saniye aralık
        backoff: true, // Gecikme her başarısızlıkta katlanır
        describeInstead: true, // Başarısız olursa açıklama alınır
      },
      {
        prompt: "uçan pizzacı robot",
        output: "drone.png",
        retry: 2,
        retryDelay: 1000,
        backoff: false,
        describeInstead: true,
      },
    ]);

    // Tarayıcı kapatılır
    await gpt.close();
  } catch (err) {
    logError("🚨 Genel hata: " + err.message);
  }
};

run();
