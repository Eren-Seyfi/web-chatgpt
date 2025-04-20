// puppeteer-extra paketi ve stealth eklentisi içe aktarılıyor
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Dosya ve yol işlemleri için modüller
import fs from "fs-extra";
import path from "path";

// Yardımcı fonksiyonlar
import { delay } from "./lib/utils/delay.js";
import { logInfo, logSuccess } from "./lib/utils/logger.js";

// Puppeteer'a Stealth (gizlilik) eklentisi ekleniyor — bot tespiti zorlaştırılır
puppeteer.use(StealthPlugin());

// Çerezlerin kaydedileceği dosya yolu belirleniyor
const COOKIE_PATH = path.resolve("sessions/cookies.json");

// Tarayıcı başlatılıyor
const browser = await puppeteer.launch({
  headless: false, // Görünür modda açılır (kullanıcı müdahale edebilsin diye)
  args: [
    "--no-sandbox", // Sandboxing devre dışı
    "--disable-setuid-sandbox",
    "--disable-blink-features=AutomationControlled", // Bot tespitini azaltır
    "--disable-infobars", // “Chrome is being controlled by...” çubuğunu gizler
    "--ignore-certificate-errors", // Sertifika hatalarını yoksayar
    "--ignore-certificate-errors-spki-list",
    "--proxy-bypass-list=*", // Proxy devre dışı
    "--incognito", // Gizli modda başlatır
    "--start-maximized", // Maksimum pencereyle açılır
  ],
  defaultViewport: null, // Viewport otomatik ayarlanır
});

// Yeni sekme açılıyor
const page = await browser.newPage();

// ChatGPT giriş sayfasına gidiliyor
await page.goto("https://chat.openai.com", { waitUntil: "networkidle2" });

// Kullanıcıdan giriş yapması isteniyor
logInfo("🔐 Giriş yapmanı bekliyorum...");
logInfo("Giriş yaptıktan sonra terminale dönüp ENTER'a bas.");

// Kullanıcı ENTER'a bastığında çerezleri kaydet
process.stdin.once("data", async () => {
  await delay(1000); // Giriş tamamlandıktan sonra 1 saniye bekle
  const cookies = await page.cookies(); // Tarayıcı çerezlerini al
  await fs.ensureDir(path.dirname(COOKIE_PATH)); // Çerez dosyasının bulunduğu klasörü oluştur
  await fs.writeJson(COOKIE_PATH, cookies, { spaces: 2 }); // JSON formatında çerezleri kaydet
  logSuccess("✅ Çerezler kaydedildi.");
  await browser.close(); // Tarayıcı kapatılıyor
  process.exit(0); // Script sonlandırılıyor
});
