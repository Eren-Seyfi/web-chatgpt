// Yardımcı fonksiyonlar içe aktarılıyor
import { delay } from "../utils/delay.js"; // Bekleme fonksiyonu
import { generateImage } from "../features/DalleImage.js"; // Görsel oluşturma işlemi
import { logInfo, logError } from "../utils/logger.js"; // Loglama yardımcıları

/**
 * 🔁 Sıralı, yeniden denemeli, başarısızlık durumunda açıklama üretmeli görsel oluşturma fonksiyonu
 *
 * @param {object} page - Puppeteer sayfa nesnesi (ChatGPT sayfası)
 * @param {Array} items - Görsel üretim öğeleri dizisi:
 *   {
 *     prompt: "neon ayıcık",          // Görsel oluşturmak için istek
 *     output: "bear.png",             // Çıktı dosya adı
 *     retry: 3,                       // Maksimum deneme sayısı
 *     retryDelay: 2000,              // İlk denemeden sonraki bekleme süresi (ms)
 *     backoff: true,                 // Her başarısızlıktan sonra delay 2 katına çıkarılsın mı
 *     describeInstead: true          // Tüm denemeler başarısız olursa açıklama üretilsin mi
 *   }
 * @param {function} fallbackDescribeFn - (opsiyonel) Görsel üretilemediğinde çalışacak açıklama üretici fonksiyon
 */
export async function queueImageWithRetry(
  page,
  items = [],
  fallbackDescribeFn = null
) {
  // Her bir öğe için sırayla işlem yapılır
  for (const item of items) {
    // Parametreler içinden her bir özellik ayrıştırılır
    const {
      prompt,
      output,
      retry = 1,
      retryDelay = 2000,
      backoff = false,
      describeInstead = false,
    } = item;

    let success = false; // Üretim başarılı oldu mu?
    let currentDelay = retryDelay; // Gecikme süresi (artabilir)

    // Belirtilen deneme sayısı kadar tekrar denenir
    for (let attempt = 1; attempt <= retry; attempt++) {
      logInfo(`🔁 Deneme ${attempt}/${retry} → "${prompt}"`);

      // Görsel üretim işlemi yapılır (true dönerse başarılıdır)
      const result = await generateImage(page, prompt, output, true);
      if (result === true) {
        success = true; // İşlem başarılıysa döngüden çık
        break;
      }

      // Eğer tekrar yapılacaksa belirtilen süre kadar beklenir
      if (attempt < retry) {
        logInfo(`🕐 ${currentDelay}ms sonra tekrar denenecek...`);
        await delay(currentDelay); // Bekleme

        // Eğer artımlı bekleme (backoff) aktifse gecikme iki katına çıkarılır
        if (backoff) currentDelay *= 2;
      }
    }

    // Tüm denemeler başarısızsa fallback açıklama fonksiyonu çalıştırılır
    if (!success) {
      logError(`❌ "${prompt}" için tüm denemeler başarısız oldu.`);

      // describeInstead true ve fallback fonksiyonu tanımlıysa çalıştırılır
      if (describeInstead && typeof fallbackDescribeFn === "function") {
        logInfo("💡 Görsel yerine betimleyici metin isteniyor...");
        try {
          await fallbackDescribeFn(prompt); // Prompt'a uygun açıklama üret
        } catch (e) {
          // Eğer açıklama üretimi sırasında hata oluşursa logla
          logError(
            "⚠️ Fallback açıklama oluşturulurken hata oluştu: " + e.message
          );
        }
      }
    }

    // Her prompt arasında sabit gecikme uygulanır (istenirse kaldırılabilir)
    await delay(2000);
  }
}
