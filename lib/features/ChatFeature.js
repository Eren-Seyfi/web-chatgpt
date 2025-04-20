// Sayfaya mesaj gönderme ve cevap bitene kadar bekleme işlemleri
import { sendMessage, waitForResponseEnd } from "../core/PageController.js";

// Küçük beklemeler için kullanılan gecikme fonksiyonu
import { delay } from "../utils/delay.js";

// Bilgilendirici ve uyarı log fonksiyonları
import { logInfo, logWarn } from "../utils/logger.js";

/**
 * Belirtilen mesaj listesini sırayla ChatGPT'ye gönderir ve cevapları toplar.
 *
 * @param {object} page - Puppeteer Page nesnesi (aktif sayfa)
 * @param {Array<string>} messages - Gönderilecek mesaj dizisi
 * @returns {Array<object>} - Her bir mesaj ve yanıtını içeren dizi [{ prompt, content }]
 */
export async function handleChat(page, messages = []) {
  const responses = []; // Yanıtlar burada birikir

  // Tüm mesajlar sırayla işlenir
  for (const prompt of messages) {
    // Kullanıcıya bilgi ver
    logInfo("💬 Gönderiliyor: " + prompt);

    // Mesajı sayfaya yaz ve gönder
    await sendMessage(page, prompt);

    // Cevap bitene kadar bekle
    await waitForResponseEnd(page);

    // Gerçekçi bekleme süresi (sistem zorlanmasın)
    await delay(500);

    // Sayfadaki son yanıt içeriği alınır (".markdown" sınıfı içerir)
    const content = await page.evaluate(() => {
      const blocks = document.querySelectorAll(".markdown");
      const last = blocks[blocks.length - 1]; // En son blok
      return last?.innerText?.trim() || ""; // Metin alınır ve boşluklar kırpılır
    });

    // Eğer içerik alınamamışsa uyarı verilir, boş içerik döndürülür
    if (!content) {
      logWarn("⚠️ Boş cevap alındı. Devam ediliyor...");
      responses.push({
        prompt,
        content: "❌ Yanıt alınamadı veya boş döndü.",
      });
    } else {
      // Normal şekilde yanıt eklendi
      responses.push({ prompt, content });
    }
  }

  // Tüm cevaplar döndürülür
  return responses;
}
