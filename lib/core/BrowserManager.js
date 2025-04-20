// Gerekli modüller içe aktarılıyor
import puppeteer from "puppeteer-extra"; // Puppeteer'ın gelişmiş sürümü
import StealthPlugin from "puppeteer-extra-plugin-stealth"; // Bot tespiti engelleme eklentisi

// Puppeteer'a stealth eklentisi ekleniyor
puppeteer.use(StealthPlugin());

/**
 * Gelişmiş tarayıcı başlatma fonksiyonu
 * @param {Object} options - Başlatma yapılandırması
 * @param {boolean} options.headless - Tarayıcı görünür mü?
 * @param {Object} options.proxy - Proxy yapılandırması { enabled: boolean, server: string }
 * @param {string} options.language - Tarayıcı dili (örn: "en-US")
 * @param {boolean} options.fingerprint - navigator sahte bilgileri aktif mi?
 * @returns {Promise<{browser: Browser, page: Page}>}
 */
export async function launchBrowser({
  headless = true, // Headless mod (false ise tarayıcı arayüzü gösterilir)
  proxy = { enabled: false, server: "" }, // Proxy yapılandırması
  language = "en-US", // Tarayıcı dili
  fingerprint = true, // Fingerprint gizleme özelliği aktif mi?
}) {
  // Puppeteer başlatma argümanları
  const args = [
    "--no-sandbox", // Sandbox devre dışı (CI/CD için)
    "--disable-setuid-sandbox",
    "--disable-blink-features=AutomationControlled", // Otomasyon tespitini zorlaştırır
    "--disable-infobars", // "Chrome is being controlled by..." uyarısını gizler
    "--ignore-certificate-errors", // SSL hatalarını yoksayar
    "--ignore-certificate-errors-spki-list",
    "--proxy-bypass-list=*", // Proxy üzerinden geçilmeyecek siteler
    "--incognito", // Gizli mod
    "--start-maximized", // Tarayıcıyı maksimum boyutta aç
  ];

  // Eğer proxy etkinse, proxy argümanı eklenir
  if (proxy.enabled && proxy.server) {
    args.push(`--proxy-server=${proxy.server}`);
  }

  // Tarayıcı başlatılır
  const browser = await puppeteer.launch({
    headless, // Başlatma modu (görünür/görünmez)
    args, // Yukarıda tanımlanan argümanlar
    defaultViewport: null, // Sayfa boyutu ekran çözünürlüğüne göre belirlenir
  });

  // Yeni bir sayfa (sekme) açılır
  const page = await browser.newPage();

  // HTTP isteklerine Accept-Language başlığı eklenir
  await page.setExtraHTTPHeaders({ "Accept-Language": language });

  // Sayfa yüklendiğinde navigator bilgileri taklit edilir
  if (fingerprint) {
    await page.evaluateOnNewDocument((lang) => {
      // Tarayıcı dili
      Object.defineProperty(navigator, "language", { get: () => lang });

      // Tarayıcı desteklenen diller
      Object.defineProperty(navigator, "languages", { get: () => [lang] });

      // İşletim sistemi platform bilgisi
      Object.defineProperty(navigator, "platform", { get: () => "Win32" });

      // WebDriver (bot) tespiti kapatılır
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    }, language);
  }

  // browser ve page nesneleri geri döndürülür
  return { browser, page };
}
