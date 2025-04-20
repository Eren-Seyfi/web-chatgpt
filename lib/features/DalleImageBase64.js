// HTTPS istekleri ve veri çekmek için kullanılır
import https from "https";

// Loglama ve bekleme işlemleri için yardımcı modüller
import { logInfo, logSuccess, logError } from "../utils/logger.js";
import { delay } from "../utils/delay.js";

/**
 * ChatGPT üzerinden görsel oluşturur ve sonucu base64 formatında döndürür
 *
 * @param {object} page - Puppeteer Page nesnesi
 * @param {string} prompt - Görsel oluşturma açıklaması
 * @returns {Promise<string|null>} - Görsel base64 string olarak döner, başarısızsa null
 */
export async function generateImageBase64(page, prompt) {
  // Kullanıcıya bilgi verilir
  logInfo(`🎨 (Base64) Görsel oluşturuluyor: "${prompt}"`);

  // ChatGPT arayüzünde mesaj kutusuna erişilir ve prompt yazılır
  await page.waitForSelector("textarea", { timeout: 30000 });
  await page.type("textarea", `Bir görsel oluştur: ${prompt}`);

  // Gönder butonu aktif hale geldiğinde tıklanır
  await page.waitForSelector("#composer-submit-button:not([disabled])");
  await page.click("#composer-submit-button");

  // Log: işlem başlatıldı
  logInfo("🖌️ İstek gönderildi, görselin yüklenmesi bekleniyor...");

  let imageUrl = null;
  const maxTries = 90; // Maksimum 90 saniye deneme yapılır

  // Her saniye, görsel URL’si oluşmuş mu kontrol edilir
  for (let i = 0; i < maxTries; i++) {
    const result = await page.evaluate(() => {
      const img = document.querySelector('img[alt="Generated image"]');
      return img?.src?.startsWith("http") ? img.src : null;
    });

    if (result) {
      imageUrl = result;
      break; // URL bulunduysa döngüden çık
    }

    await delay(1000); // 1 saniye bekle ve tekrar dene
  }

  // Görsel bulunamadıysa hata verilir
  if (!imageUrl) {
    logError("❌ Görsel oluşturulamadı. URL bulunamadı.");
    return null;
  }

  // Görsel URL’si bulunduysa kullanıcıya bilgi verilir
  logSuccess("✅ Görsel bulundu. Base64 olarak indiriliyor...");

  // Görsel base64 formatında indirilir ve döndürülür
  return await downloadImageAsBase64(imageUrl);
}

/**
 * Verilen URL’den görseli indirir ve base64 formatına çevirip döner
 *
 * @param {string} url - Görselin URL’si
 * @returns {Promise<string>} - Görselin base64 string temsili (data URI formatında)
 */
function downloadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const data = []; // Chunk veriler burada biriktirilir
        res.on("data", (chunk) => data.push(chunk)); // Her veri parçası eklendiğinde

        res.on("end", () => {
          const buffer = Buffer.concat(data); // Tüm parçalar birleştirilir
          const base64 = buffer.toString("base64"); // Base64 formatına dönüştürülür
          resolve(`data:image/png;base64,${base64}`); // Data URI olarak döndürülür
        });
      })
      .on("error", (err) => {
        logError("❌ Görsel indirilemedi: " + err.message); // Hata varsa logla
        reject(err);
      });
  });
}
