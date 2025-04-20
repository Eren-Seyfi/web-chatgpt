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

| Option           | Description                          |
|------------------|--------------------------------------|
| `model`         | GPT model (`gpt-4`, `gpt-3.5`)       |
| `language`      | Browser language (`en-US`, `tr-TR`)  |
| `stealth`       | Enable/disable stealth plugin        |
| `fingerprint`   | Fake navigator fingerprint           |
| `headless`      | Run browser in headless mode         |
| `proxy.enabled` | Whether to use proxy                 |
| `proxy.server`  | Proxy server address                 |
| `cookiePath`    | Where to store cookies               |

---

## 🔐 Login & Session Management

The library automatically handles session logic:

1. When `createChatGPT()` is called, it first checks for cookies.
2. If valid, it skips login and proceeds.
3. If not, the browser is opened for manual login.
4. After successful login, cookies are saved to `sessions/cookies.json`.

> Login is only required once, future sessions use cookies.

### Custom Cookie Path

```js
await createChatGPT({
  cookiePath: "my-data/login.json"
});
```

---

## 🧪 Full Integration Example

```js
const gpt = await createChatGPT({ model: "gpt-4", headless: false });

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

---

🇹🇷 Türkçe dokümantasyon için: [`web-chatgpt-doc.md`](./web-chatgpt-doc.md)
