// Yardımcı modüller içe aktarılıyor
import { delay } from "../utils/delay.js"; // Belirtilen süre kadar bekleme fonksiyonu
import { logInfo } from "../utils/logger.js"; // Bilgi amaçlı loglama aracı

/**
 * ChatGPT arayüzüne mesaj gönderir ve ardından cevabın tamamlanmasını bekler.
 * Bu fonksiyonlar genelde bir arada çalışır.
 */

/**
 * Sayfada yer alan mesaj kutusuna mesaj yazar ve gönder butonuna tıklar.
 * @param {object} page - Puppeteer Page nesnesi
 * @param {string} message - Gönderilecek mesaj içeriği
 */
export async function sendMessage(page, message) {
  // Mesaj kutusunun yüklendiğinden emin olunur (maksimum 45 saniye beklenir)
  await page.waitForSelector("textarea", { timeout: 45000 });

  // Eğer mesaj kutusunda önceki bir metin varsa temizlenir
  await page.evaluate(() => {
    const textarea = document.querySelector("textarea");
    if (textarea) textarea.value = ""; // Önceki içerik silinir
  });

  // Yeni mesaj kutuya yazılır (kullanıcı yazıyormuş gibi)
  await page.type("textarea", message);

  // Gönder butonu aktif hâle gelene kadar beklenir
  await page.waitForSelector("#composer-submit-button:not([disabled])");

  // Gerçek bir kullanıcı davranışı gibi gecikme eklenir
  await delay(300);

  // Gönder butonuna tıklanır
  await page.click("#composer-submit-button");

  // Log kaydı tutulur
  logInfo("📨 Mesaj gönderildi.");
}

/**
 * Mesaj gönderildikten sonra yanıtın bitmesini bekler.
 * @param {object} page - Puppeteer Page nesnesi
 */
export async function waitForResponseEnd(page) {
  // Öncelikle mesajın işlendiğini belirten "stop button" görsel olarak beklenir
  await page.waitForSelector(
    '#composer-submit-button[data-testid="stop-button"]',
    { timeout: 10000 } // 10 saniye içinde gelmezse hata fırlatır
  );

  // Log kaydı
  logInfo("⏳ Cevap bekleniyor...");

  // Yanıt tamamlandığında:
  // - "stop button" kaybolmalı
  // - "speech button" (sesli yanıt gönder) görünür olmalı
  await page.waitForFunction(
    () => {
      const stop = document.querySelector(
        '#composer-submit-button[data-testid="stop-button"]'
      );
      const speech = document.querySelector(
        '[data-testid="composer-speech-button"]'
      );
      return !stop && !!speech;
    },
    { timeout: 60000 } // En fazla 1 dakika beklenir
  );

  // Log kaydı
  logInfo("✅ Cevap tamamlandı.");
}
