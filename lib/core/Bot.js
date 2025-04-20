// Tarayıcı başlatma işlemlerini yöneten yardımcı fonksiyon içe aktarılıyor
import { launchBrowser } from "./BrowserManager.js";

// Çerezleri yükleme ve kaydetme işlemlerini yapan yardımcı fonksiyonlar
import { loadCookies, saveCookies } from "./SessionManager.js";

// Mesaj gönderme ve yanıt alma işlemini yöneten özellik modülü
import { handleChat } from "../features/ChatFeature.js";

// Bot sınıfı tanımlanıyor
export default class Bot {
  // Constructor, yapılandırma ayarlarını alır (örneğin: model, proxy, headless, cookiePath)
  constructor(config) {
    this.config = config;
  }

  // Tarayıcıyı başlatıp gerekli kontrolleri yapan fonksiyon
  async init() {
    // launchBrowser fonksiyonu ile tarayıcı ve yeni sayfa açılır
    const { browser, page } = await launchBrowser(this.config);
    this.browser = browser; // browser nesnesi sınıf değişkenine atanır
    this.page = page; // page nesnesi sınıf değişkenine atanır

    // Daha önce kaydedilmiş çerezler varsa yüklenir
    await loadCookies(this.page, this.config.cookiePath);

    // OpenAI ChatGPT sayfasına yönlendirilir (model parametresi ile birlikte)
    await this.page.goto(
      `https://chat.openai.com/?model=${this.config.model}`,
      {
        waitUntil: "domcontentloaded", // Sayfa içeriği yüklendiğinde devam et
      }
    );

    // Eğer Cloudflare güvenlik doğrulaması varsa beklenir
    const cf = await this.page.$("#challenge-form");
    if (cf) {
      console.log("☁️ Cloudflare tespit edildi, bekleniyor...");
      // challenge-form elementi kaybolana kadar beklenir (max 30 saniye)
      await this.page.waitForFunction(
        () => !document.querySelector("#challenge-form"),
        {
          timeout: 30000,
        }
      );
    }

    // Giriş yapılıp yapılmadığını kontrol et (textarea elementi mevcut mu?)
    const loggedIn = (await this.page.$("textarea")) !== null;
    if (!loggedIn) {
      console.log("❌ Giriş yapılmamış."); // Eğer giriş yoksa uyarı ver
      return false; // init başarısız döner
    }

    return true; // init başarılıysa true döner
  }

  // Chat fonksiyonu — mesajları gönderip cevapları döner
  async chat(messages = []) {
    // handleChat fonksiyonu sayfaya mesajları gönderir ve cevapları alır
    const results = await handleChat(this.page, messages);

    // Oturum çerezleri güncellenip tekrar kaydedilir
    await saveCookies(this.page, this.config.cookiePath);

    return results; // Chat sonuçlarını döndür
  }

  // Tarayıcıyı kapatmak için kullanılan fonksiyon
  async close() {
    // Tarayıcı nesnesi varsa kapatılır
    await this.browser?.close();
  }
}
