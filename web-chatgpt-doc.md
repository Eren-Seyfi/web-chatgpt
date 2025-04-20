# 🧠 web-chatgpt — Gelişmiş Otomasyon Sistemi

Puppeteer + Stealth ile ChatGPT web arayüzü üzerinde çalışan **tam otomatik bir sohbet ve görsel üretim kütüphanesi**. Bu sistem, hem CLI hem de modül olarak kullanılabilir.

---

## 🚀 Özellikler

- 💬 ChatGPT’ye otomatik mesaj gönderme ve sıralı cevap alma
- 🎨 DALL·E destekli görsel oluşturma (.png veya base64)
- 🔁 Yeniden deneme destekli görsel üretimi (`queueImage`)
- 🧠 Başarısızlık durumunda betimleme (`describeInstead`)
- ☁️ Cloudflare korumasına karşı Stealth desteği
- 🍪 Oturum (çerez) yönetimi: 1 kez giriş yeterli!
- ⚙️ Proxy, dil, headless, fingerprint gibi ileri düzey yapılandırmalar

---

## 📦 Kurulum

```bash
git clone https://github.com/Eren-Seyfi/web-chatgpt.git
cd web-chatgpt
npm install
```

---

## 📂 Dosya Yapısı

```
web-chatgpt/
├── index.js                → Ana uygulama girişi
├── login.js                → Oturum çerezi oluşturucu
├── test.js                 → Örnek işlemler
├── sessions/cookies.json   → Otomatik kaydedilen oturum çerezi
├── lib/
│   ├── core/               → Bot, queue, sayfa kontrol sınıfları
│   ├── features/           → Görsel üretimi, chat özelliği
│   └── utils/              → delay, logger, yardımcı araçlar
└── package.json            → Proje yapılandırması
```

---

## 🧪 Komutlar

| Komut             | Açıklama                                              |
|-------------------|--------------------------------------------------------|
| `npm run login`   | Giriş yapmanı bekler, çerezleri `sessions/` içine kaydeder |
| `npm run test`    | `test.js` çalıştırılır, örnek işlemler yapılır        |
| `npm start`       | `index.js` başlatılır                                 |
| `npm run dev`     | `nodemon` ile canlı geliştirme başlatılır             |

---

## 💬 `chat(messages: string[])`

```js
const res = await gpt.chat(["Merhaba!", "Komik bir fıkra anlat."]);
```

Gelen cevap:
```js
[
  { prompt: "Merhaba!", content: "Selam! 👋 Nasılsın?" },
  { prompt: "Komik bir fıkra anlat.", content: "Temel ile Dursun..." }
]
```

---

## 🖼️ `image(prompt, outputPath)`

```js
await gpt.image("ışıklı camdan bir ayıcık", "bear.png");
```

---

## 🧩 `imageBase64(prompt)`

```js
const base64 = await gpt.imageBase64("gece parlayan kristal kelebek");
console.log(base64.slice(0, 100) + "...");
```

Kullanım: `<img src="data:image/png;base64,...">`

---

## 📦 `queueImage(items, fallbackDescribeFn?)`

```js
await gpt.queueImage([
  {
    prompt: "neon ayıcık",
    output: "bear.png",
    retry: 3,
    retryDelay: 2000,
    backoff: true,
    describeInstead: true
  }
], async (prompt) => {
  await gpt.describe(prompt);
});
```

---

## 🧠 `describe(prompt)`

```js
await gpt.describe("neon ayıcık");
```

---

## ⚙️ Yapılandırma Ayarları

| Ayar            | Açıklama                             |
|------------------|--------------------------------------|
| `model`         | GPT modeli (`gpt-4`, `gpt-3.5`)       |
| `language`      | Tarayıcı dili (`en-US`, `tr-TR`)      |
| `stealth`       | Stealth aktif/pasif                   |
| `fingerprint`   | navigator taklidi yapılacak mı        |
| `headless`      | Tarayıcı arayüzsüz çalışsın mı        |
| `proxy.enabled` | Proxy kullanılsın mı                  |
| `proxy.server`  | Proxy sunucu adresi                   |
| `cookiePath`    | Çerezlerin yeri (`sessions/cookies.json`) |

---

## 🔐 Giriş ve Oturum Yönetimi

Kütüphane giriş sürecini otomatikleştirir:

1. `createChatGPT()` çağrıldığında önce çerez kontrol edilir.
2. Çerez varsa otomatik giriş yapılır.
3. Yoksa kullanıcıdan manuel giriş istenir.
4. Giriş sonrası `sessions/cookies.json` dosyası oluşturulur.

> Giriş bir kez yapılır, sonraki her işlem otomatik devam eder.

### Özelleştirme

```js
await createChatGPT({
  cookiePath: "my-data/login.json"
});
```

---

## 🧪 Tam Entegrasyon Örneği

```js
const gpt = await createChatGPT({ model: "gpt-4", headless: false });

await gpt.chat(["Selam!", "Bugün nasılsın?"]);
await gpt.image("gecede kitap okuyan baykuş", "owl.png");

const base64 = await gpt.imageBase64("dumanlar içinde kalan antik şehir");
console.log(base64.slice(0, 100));

await gpt.queueImage([
  {
    prompt: "kristal çaydanlık",
    output: "teapot.png",
    retry: 3,
    retryDelay: 2000,
    backoff: true,
    describeInstead: true
  }
], async (prompt) => {
  await gpt.describe(prompt);
});

await gpt.close();
```

---

## 👨‍💻 Geliştirici

**Eren Seyfi**  
📫 eren50seyfi@gmail.com  
🌐 [GitHub](https://github.com/erenseyfi)

---

## 📜 Lisans

MIT © 2025 Eren Seyfi
