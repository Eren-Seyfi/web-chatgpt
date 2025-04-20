# 🇹🇷 [Türkçe Dokümantasyon İçin Tıklayın →](./web-chatgpt-doc.md)

> 📘 This is the English version of the documentation. For the Turkish version, please refer to the link above.

# 🧠 web-chatgpt — Advanced Automation System

A fully automated **ChatGPT conversation and image generation library** using Puppeteer + Stealth. This system works both as a CLI tool and as a reusable module.

---

## 🚀 Features

- 💬 Automatically send messages to ChatGPT and receive ordered responses
- 🎨 Generate images using DALL·E (.png or base64)
- 🔁 Retry-supported image generation (`queueImage`)
- 🧠 Descriptive fallback for failed generations (`describeInstead`)
- ☁️ Stealth support against Cloudflare and bot protections
- 🍪 Session (cookie) management: login once and reuse
- ⚙️ Advanced configuration: proxy, language, headless, fingerprint etc.

---

## 📦 Installation

```bash
git clone https://github.com/Eren-Seyfi/web-chatgpt.git
cd web-chatgpt
npm install
```

---

## 📂 File Structure

```
web-chatgpt/
├── index.js                → Main entry point
├── login.js                → Login utility to save cookies
├── test.js                 → Test scripts
├── sessions/cookies.json   → Saved session cookies
├── lib/
│   ├── core/               → Bot, queue, page controllers
│   ├── features/           → Chat, image generation features
│   └── utils/              → delay, logger, helpers
└── package.json            → Project configuration
```

---

## 🧪 Commands

| Command           | Description                                        |
|-------------------|----------------------------------------------------|
| `npm run login`   | Opens login page and saves cookies to `sessions/` |
| `npm run test`    | Executes `test.js` with sample chat/image logic   |
| `npm start`       | Runs `index.js`                                   |
| `npm run dev`     | Starts development mode with `nodemon`            |

---

## 💬 `chat(messages: string[])`

```js
const res = await gpt.chat(["Hello!", "Tell me a random joke."]);
```

Response:
```js
[
  { prompt: "Hello!", content: "Hi there! 👋 How can I help you?" },
  { prompt: "Tell me a random joke.", content: "Why did the..." }
]
```

---

## 🖼️ `image(prompt, outputPath)`

```js
await gpt.image("a teddy bear made of glowing glass", "bear.png");
```

---

## 🧩 `imageBase64(prompt)`

```js
const base64 = await gpt.imageBase64("a glowing butterfly at night");
console.log(base64.slice(0, 100) + "...");
```

Use: `<img src="data:image/png;base64,...">`

---

## 📦 `queueImage(items, fallbackDescribeFn?)`

```js
await gpt.queueImage([
  {
    prompt: "neon teddy bear",
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
await gpt.describe("neon teddy bear");
```

---

## ⚙️ Configuration Options

These can be passed to `createChatGPT({...})`:

| Option           | Type      | Description |
|------------------|-----------|-------------|
| `model`          | `string`  | GPT model to use (`gpt-4`, `gpt-3.5`) |
| `headless`       | `boolean` | Whether to hide browser UI (`true` by default) |
| `language`       | `string`  | Browser language (`en-US`, `tr-TR`, etc.) |
| `stealth`        | `boolean` | Enables puppeteer-extra stealth plugin |
| `fingerprint`    | `boolean` | Fakes `navigator.language`, `platform`, etc. |
| `proxy.enabled`  | `boolean` | Use proxy server |
| `proxy.server`   | `string`  | Proxy URL like `http://127.0.0.1:8080` |
| `cookiePath`     | `string`  | File path to store session cookies (`sessions/cookies.json` by default) |

---

## 🔐 Login & Session Management

The library handles session cookies automatically.

### 🔓 Without Login (No Cookies)

- If no cookie file exists or the session is invalid:
  - The browser will open
  - You must manually log in to ChatGPT
  - After login, cookies will be saved to disk
  - On next run, login will be skipped

### 🔐 With Login (Existing Cookies)

- If valid cookies exist:
  - Login screen is skipped
  - You are automatically signed in
  - This makes repeated automation faster and seamless

> ✅ Tip: run `npm run login` manually once to save a working session before automation.

---

## 🧪 Full Integration Example

```js
import { createChatGPT } from "./index.js";

const gpt = await createChatGPT({
  model: "gpt-4",            // GPT model to use
  headless: false,           // Show browser window
  language: "tr-TR",         // Set browser language to Turkish
  stealth: true,             // Enable stealth plugin to avoid bot detection
  fingerprint: true,         // Fake navigator fingerprint
  proxy: {
    enabled: false,          // Disable proxy
    server: ""               // Proxy address if needed
  },
  cookiePath: "sessions/cookies.json" // Path to session cookie file
});

await gpt.chat(["Hello!", "How are you today?"]);

await gpt.image("an owl reading a book under lamp light", "owl.png");

const base64 = await gpt.imageBase64("an ancient city in smoke");
console.log(base64.slice(0, 100));

await gpt.queueImage([
  {
    prompt: "crystal teapot",
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

## 👨‍💻 Author

**Eren Seyfi**  
📫 eren50seyfi@gmail.com  
🌐 [GitHub](https://github.com/Eren-Seyfi)

---

## 📜 License

MIT © 2025 Eren Seyfi
