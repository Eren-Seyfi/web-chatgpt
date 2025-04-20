// Gerekli modüller içe aktarılıyor
import fs from "fs"; // Dosya sistemi işlemleri
import https from "https"; // HTTPS üzerinden veri indirme
import path from "path"; // Yol işlemleri (gerekirse kullanılabilir)
import { logInfo, logSuccess, logError, logWarn } from "../utils/logger.js"; // Log fonksiyonları
import { delay } from "../utils/delay.js"; // Gecikme (ms) için kullanılan fonksiyon

/**
 * ChatGPT sayfasına görsel oluşturma komutu gönderir ve oluşan görseli indirerek kaydeder.
 *
 * @param {object} page - Puppeteer Page nesnesi
 * @param {string} prompt - Görsel oluşturmak için verilen açıklama metni
 * @param {string} outputPath - Kaydedilecek görselin yolu (varsayılan: output.png)
 * @param {boolean} quiet - true ise log çıktıları bastırılır
 * @returns {boolean} - Görsel başarıyla oluşturulup indirildiyse true, aksi halde false
 */
export async function generateImage(
  page,
  prompt,
  outputPath = "output.png",
  quiet = false
) {
  // Sessiz mod değilse prompt bilgisi loglanır
  if (!quiet) logInfo(`🎨 Görsel oluşturuluyor: "${prompt}"`);

  // ChatGPT sayfasındaki textarea alanı yüklendi mi?
  await page.waitForSelector("textarea", { timeout: 30000 });

  // Prompt, "Bir görsel oluştur:" öneki ile yazılır
  await page.type("textarea", `Bir görsel oluştur: ${prompt}`);

  // Gönder butonu aktif hale gelene kadar beklenir
  await page.waitForSelector("#composer-submit-button:not([disabled])");

  // Butona tıklanarak istek gönderilir
  await page.click("#composer-submit-button");

  // Log: görsel oluşturma isteği gönderildi
  if (!quiet)
    logInfo(
      "🖌️ Resim oluşturma isteği gönderildi. Görsel yüklenmesi bekleniyor..."
    );

  // Görselin URL'si buraya yazılacak
  let imageUrl = null;

  // 90 kez deneme yapılır (her biri 1 saniye aralıkla)
  const maxTries = 90;

  for (let i = 0; i < maxTries; i++) {
    // Sayfada "Generated image" olan bir <img> etiketi var mı kontrol edilir
    const result = await page.evaluate(() => {
      const img = document.querySelector('img[alt="Generated image"]');
      return img?.src?.startsWith("http") ? img.src : null;
    });

    // Eğer bulunduysa döngüden çık
    if (result) {
      imageUrl = result;
      break;
    }

    // Eğer görsel oluşturma başarısız olduysa (Stopped creating image) logla ve sonlandır
    const stopped = await page.evaluate(() => {
      const stoppedMsg = document.querySelector("button[disabled] span");
      return stoppedMsg?.innerText?.includes("Stopped creating image");
    });

    if (stopped) {
      logWarn(
        "⚠️ Görsel oluşturma işlemi durduruldu (Stopped creating image)."
      );
      return false;
    }

    // Bir saniye bekle ve tekrar dene
    await delay(1000);
  }

  // 90 denemeye rağmen görsel URL’si bulunamadıysa hata döndür
  if (!imageUrl) {
    logError("❌ Görsel oluşturulamadı. URL bulunamadı.");
    return false;
  }

  // Log: görsel bulundu
  logSuccess("✅ Görsel bulundu, indiriliyor...");

  // İlgili görsel URL’si indirilerek belirtilen outputPath'e kaydedilir
  await downloadImage(imageUrl, outputPath);

  // Başarı mesajı
  logSuccess(`✅ Görsel başarıyla kaydedildi: ${outputPath}`);
  return true;
}

/**
 * Belirtilen URL’den görsel dosyasını indirir ve yerel diske kaydeder.
 *
 * @param {string} url - İndirilecek görselin URL’si
 * @param {string} dest - Kaydedilecek dosya yolu
 * @returns {Promise<void>}
 */
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    // Yazmak için dosya akışı başlatılır
    const file = fs.createWriteStream(dest);

    // HTTPS üzerinden GET isteği yapılır
    https
      .get(url, (response) => {
        // Yanıt akışı dosyaya yazılır
        response.pipe(file);

        // Dosya tamamen indirildiğinde işlem tamamlanır
        file.on("finish", () => {
          file.close(resolve); // Dosya kapatılıp işlem bitirilir
        });
      })
      .on("error", (err) => {
        // Hata varsa dosya silinir ve işlem reddedilir
        fs.unlink(dest, () => reject(err));
      });
  });
}
