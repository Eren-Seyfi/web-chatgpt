# 🇹🇷 web-chatgpt — Gelişmiş Otomasyon Sistemi

> 📘 Bu dökümantasyonun İngilizce versiyonu için [tıklayın →](./web-chatgpt-README-MERGED.md)

Tam otomatik **ChatGPT konuşma ve görsel üretim kütüphanesi**. Puppeteer + Stealth kullanır. CLI aracı olarak veya modül şeklinde kullanılabilir.

---

## 🚀 Özellikler

- 💬 ChatGPT’ye otomatik mesaj gönderme ve sıralı cevap alma
- 🎨 DALL·E kullanarak görsel oluşturma (.png veya base64)
- 🔁 Yeniden deneme destekli görsel üretimi (`queueImage`)
- 🧠 Başarısız görsel üretimlerinde açıklama alınması (`describeInstead`)
- ☁️ Cloudflare ve bot korumasına karşı Stealth desteği
- 🍪 Oturum (çerez) yönetimi: bir kez giriş, tekrar kullanım
- ⚙️ Gelişmiş yapılandırmalar: proxy, dil, headless, fingerprint vs.

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
├── index.js                → Ana giriş noktası
├── login.js                → Giriş çerezi kaydetme aracı
├── test.js                 → Test komutları
├── sessions/cookies.json   → Kaydedilmiş oturum çerezleri
├── lib/
│   ├── core/               → Bot, sıralama, sayfa kontrolü
│   ├── features/           → Sohbet ve görsel üretim modülleri
│   └── utils/              → delay, logger, yardımcılar
└── package.json            → Proje yapılandırma dosyası
```

---

## 🧪 Komutlar

| Komut            | Açıklama                                                |
|------------------|----------------------------------------------------------|
| `npm run login`  | Giriş ekranını açar, giriş yapmanı bekler ve çerezi kaydeder |
| `npm run test`   | `test.js` içindeki örnek işlemleri çalıştırır           |
| `npm start`      | Ana uygulamayı başlatır (`index.js`)                     |
| `npm run dev`    | `nodemon` ile geliştirme modunu başlatır                 |

---

## 💬 `chat(messages: string[])`

```js
const res = await gpt.chat(["Merhaba!", "Komik bir fıkra anlatır mısın?"]);
```

Yanıt:
```js
[
  { prompt: "Merhaba!", content: "Selam! 👋 Sana nasıl yardımcı olabilirim?" },
  { prompt: "Komik bir fıkra anlatır mısın?", content: "Temel ile Dursun..." }
]
```

---

## 🖼️ `image(prompt, outputPath)`

```js
await gpt.image("ışıklı camdan yapılmış bir ayıcık", "bear.png");
```

---

## 🧩 `imageBase64(prompt)`

```js
const base64 = await gpt.imageBase64("gece parlayan bir kelebek");
console.log(base64.slice(0, 100) + "...");
```

Kullanım örneği: `<img src="data:image/png;base64,...">`

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

## ⚙️ Yapılandırma Seçenekleri

Aşağıdaki parametreler `createChatGPT({...})` fonksiyonuna gönderilebilir:

| Parametre        | Tür       | Açıklama |
|------------------|-----------|----------|
| `model`          | `string`  | Kullanılacak model (`gpt-4`, `gpt-3.5`) |
| `headless`       | `boolean` | Tarayıcı arayüzsüz mü çalışsın? |
| `language`       | `string`  | Tarayıcı dili (`tr-TR`, `en-US` vs.) |
| `stealth`        | `boolean` | Stealth eklentisi aktif/pasif |
| `fingerprint`    | `boolean` | navigator bilgileri taklit edilsin mi |
| `proxy.enabled`  | `boolean` | Proxy kullanılacak mı |
| `proxy.server`   | `string`  | Proxy adresi (örnek: `http://127.0.0.1:8080`) |
| `cookiePath`     | `string`  | Çerez dosyasının yolu (varsayılan: `sessions/cookies.json`) |

---

## 🔐 Giriş ve Oturum Yönetimi

Kütüphane oturum çerezlerini otomatik olarak yönetir.

### 🔓 Giriş Yapmadan (Çerez Yoksa)

- Çerez dosyası yoksa veya geçersizse:
  - Tarayıcı açılır
  - Kullanıcıdan ChatGPT’ye giriş yapması beklenir
  - Girişten sonra çerezler kaydedilir
  - Sonraki çalıştırmalarda giriş ekranı atlanır

### 🔐 Giriş Yapıldıysa (Çerez Varsa)

- Geçerli çerez varsa:
  - Giriş yapılmış sayılır
  - Otomasyon doğrudan başlar

> ✅ Öneri: `npm run login` komutunu bir kez çalıştırarak giriş yap ve çerezi kaydet.

---

## 🧪 Tümleşik Örnek Kullanım

```js
import { createChatGPT } from "./index.js";

const gpt = await createChatGPT({
  model: "gpt-4",
  headless: false,
  language: "tr-TR",
  stealth: true,
  fingerprint: true,
  proxy: {
    enabled: false,
    server: ""
  },
  cookiePath: "sessions/cookies.json"
});

await gpt.chat(["Merhaba!", "Bugün nasılsın?"]);

await gpt.image("lambanın ışığında kitap okuyan bir baykuş", "owl.png");

const base64 = await gpt.imageBase64("dumanlar içindeki antik şehir");
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
🌐 [GitHub](https://github.com/Eren-Seyfi)

---

## 📜 Lisans

MIT © 2025 Eren Seyfi
