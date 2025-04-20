// Dosya işlemleri için fs-extra modülü içe aktarılır
import fs from "fs-extra";

/**
 * Tarayıcıya çerezleri (cookies) yükler
 * @param {object} page - Puppeteer sayfa nesnesi
 * @param {string} path - Çerezlerin yükleneceği JSON dosyasının yolu
 */
export async function loadCookies(page, path) {
  // Belirtilen dosya yolu var mı kontrol edilir
  if (await fs.pathExists(path)) {
    try {
      // JSON formatındaki çerezler dosyadan okunur
      const cookies = await fs.readJson(path);

      // Çerezler tarayıcıya set edilir
      await page.setCookie(...cookies);
    } catch {
      // Eğer dosya okunamıyorsa, bozulmuş olabilir — silinir
      await fs.remove(path);
    }
  }
}

/**
 * Tarayıcıdaki mevcut çerezleri alıp belirtilen yola JSON olarak kaydeder
 * @param {object} page - Puppeteer sayfa nesnesi
 * @param {string} path - Çerezlerin kaydedileceği JSON dosyasının yolu
 */
export async function saveCookies(page, path) {
  // Sayfadaki mevcut çerezler alınır
  const cookies = await page.cookies();

  // JSON formatında dosya sistemine yazılır (varsa overwrite edilir)
  await fs.outputJson(path, cookies, { spaces: 2 });
}
