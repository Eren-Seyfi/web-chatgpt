// Gerekli modüller içe aktarılıyor
import Bot from "./lib/core/Bot.js"; // Puppeteer ile çalışan ana bot sınıfı
import { generateImage } from "./lib/features/DalleImage.js"; // DALL·E ile görsel üretimi (dosya olarak)
import { generateImageBase64 } from "./lib/features/DalleImageBase64.js"; // DALL·E ile görsel üretimi (Base64 olarak)
import { queueImageWithRetry } from "./lib/core/GPTQueueHelper.js"; // Görsel üretimi için sıralı işlem ve retry mekanizması
import { logError, logInfo } from "./lib/utils/logger.js"; // Loglama işlemleri
import { delay } from "./lib/utils/delay.js"; // Gecikme fonksiyonu

// createChatGPT: Bot örneği oluşturur ve Chat, Image, ImageBase64 gibi methodlar sağlar
export async function createChatGPT(config = {}) {
  // Bot sınıfı yapılandırılarak oluşturuluyor
  const bot = new Bot({
    model: config.model || "gpt-4", // Kullanılacak model (varsayılan gpt-4)
    stealth: config.stealth !== false, // Stealth mod açık mı
    fingerprint: config.fingerprint !== false, // Parmak izi taklidi açık mı
    headless: config.headless !== false, // Headless mod açık mı
    language: config.language || "en-US", // Tarayıcı dili
    proxy: config.proxy || { enabled: false, server: "" }, // Proxy ayarları
    useSavedCookies: config.useSavedCookies !== false, // Oturum çerezi yüklenecek mi
    cookiePath: config.cookiePath || "sessions/cookies.json", // Çerez dosyası yolu
  });

  // Bot başlatılıyor (tarayıcı açılıyor ve giriş yapılıyor)
  const isReady = await bot.init();

  // Giriş başarısızsa kapat ve hata ver
  if (!isReady) {
    await bot.close();
    logError("Giriş yapılamadı.");
    throw new Error("Giriş yapılamadı.");
  }

  // Başarılıysa aşağıdaki fonksiyonları içeren bir nesne döndür
  return {
    // Metin tabanlı sohbet
    chat: async (messages) => await bot.chat(messages),

    // Görsel oluşturma (dosya olarak kaydetme)
    image: async (prompt, outputPath = "output.png") => {
      const result = await generateImage(bot.page, prompt, outputPath);
      return result;
    },

    // Görsel oluşturma (base64 string olarak döndürme)
    imageBase64: async (prompt) => {
      const base64 = await generateImageBase64(bot.page, prompt);
      return base64;
    },

    // Prompt'a göre betimleyici açıklama üretme
    describe: async (prompt) => {
      logInfo(`📝 Betimleyici açıklama isteniyor: ${prompt}`);

      // Chat alanını bul ve prompt'u yaz
      await bot.page.waitForSelector("textarea", { timeout: 30000 });
      await bot.page.type(
        "textarea",
        `Lütfen şu sahnenin detaylı bir betimlemesini yaz: ${prompt}`
      );

      // Gönder butonunu bekle ve tıkla
      await bot.page.waitForSelector("#composer-submit-button:not([disabled])");
      await bot.page.click("#composer-submit-button");

      logInfo("💬 Açıklama bekleniyor...");

      // Mesaj tamamlanana kadar bekle
      await bot.page.waitForFunction(
        () => {
          const stop = document.querySelector(
            '#composer-submit-button[data-testid="stop-button"]'
          );
          const speech = document.querySelector(
            '[data-testid="composer-speech-button"]'
          );
          return !stop && !!speech; // Stop butonu kalktıysa ve sesli mesaj butonu varsa işlem bitmiş demektir
        },
        { timeout: 60000 }
      );

      // En son yanıtı al
      const response = await bot.page.evaluate(() => {
        const blocks = document.querySelectorAll(".markdown");
        const last = blocks[blocks.length - 1];
        return last?.innerText || "Açıklama alınamadı.";
      });

      logInfo("🧠 Açıklama:\n" + response);
    },

    // Prompt listesine göre sırayla açıklama alıp görsel üret
    queueImage: async (items = []) => {
      await queueImageWithRetry(bot.page, items, async (prompt) => {
        await bot.page.bringToFront(); // Sayfayı öne getir
        await delay(1000); // Kısa bekleme

        // Önceki veri varsa temizle
        await bot.page.evaluate(() => {
          const textarea = document.querySelector("textarea");
          if (textarea) textarea.value = "";
        });

        await delay(500); // Biraz daha bekleme

        // Prompt giriliyor
        await bot.page.type(
          "textarea",
          `Lütfen şu sahnenin detaylı bir betimlemesini yaz: ${prompt}`
        );

        // Gönder ve tamamlanmasını bekle
        await bot.page.waitForSelector(
          "#composer-submit-button:not([disabled])"
        );
        await bot.page.click("#composer-submit-button");

        await bot.page.waitForFunction(
          () => {
            const stop = document.querySelector(
              '#composer-submit-button[data-testid="stop-button"]'
            );
            const speech = document.querySelector(
              '[data-testid="composer-speech-button"]'
            );
            return !stop && !!speech;
          },
          { timeout: 60000 }
        );

        // Açıklama alınır
        const description = await bot.page.evaluate(() => {
          const blocks = document.querySelectorAll(".markdown");
          const last = blocks[blocks.length - 1];
          return last?.innerText || "Açıklama alınamadı.";
        });

        logInfo("🧠 Betimleme:\n" + description);
      });
    },

    // Botu kapatma fonksiyonu
    close: async () => await bot.close(),
  };
}
