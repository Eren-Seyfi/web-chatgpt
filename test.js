import { createChatGPT } from "./index.js";
import { logInfo, logSuccess, logError } from "./lib/utils/logger.js";

// Main execution function
const run = async () => {
  try {
    // 🔧 Initialize ChatGPT automation system
    const gpt = await createChatGPT({
      // 💡 Model to use (e.g., gpt-4, gpt-3.5)
      model: "gpt-4",

      // 🖥️ Headless: false → browser UI will be visible
      headless: false,

      // 🌐 Browser language (ChatGPT interface will load in Turkish)
      language: "tr-TR",

      // 🕵️‍♂️ Enable stealth mode (to reduce bot detection)
      stealth: true,

      // 🧬 Enable fake navigator.language and fingerprint spoofing
      fingerprint: true,

      // 🌍 Proxy configuration
      proxy: {
        enabled: false, // false: disable proxy
        server: "", // e.g., "http://127.0.0.1:8000"
      },

      // 📁 Cookie path (default: sessions/cookies.json)
      // cookiePath: "sessions/cookies.json"
    });

    // 🎯 1. Chat feature (send messages and receive responses)
    const chatResponses = await gpt.chat([
      "Hello! How are you?",
      "Can you tell me a funny joke?",
    ]);

    chatResponses.forEach((res, i) => {
      logInfo(`\n📨 Prompt ${i + 1}: ${res.prompt}`);
      logSuccess(`🧠 Response:\n${res.content}`);
    });

    // 🎯 2. Generate a single image and save it to disk
    await gpt.image("a teddy bear made of glowing glass", "bear.png");

    // 🎯 3. Generate image and return as base64 string
    const base64 = await gpt.imageBase64(
      "a crystal butterfly swimming in a purple foggy forest"
    );
    console.log("📷 Base64 (first 100 chars):", base64.slice(0, 100) + "...");

    // 🎯 4. Generate multiple images in sequence with retry + backoff + fallback
    await gpt.queueImage([
      {
        prompt: "neon teddy bear",
        output: "neon-bear.png",
        retry: 3, // Maximum 3 attempts
        retryDelay: 2000, // 2 seconds delay between attempts
        backoff: true, // Delay will double after each failed attempt
        describeInstead: true, // If all retries fail, get a text description instead
      },
      {
        prompt: "flying pizza delivery robot",
        output: "drone.png",
        retry: 2,
        retryDelay: 1000,
        backoff: false,
        describeInstead: true,
      },
    ]);

    // Close the browser session
    await gpt.close();
  } catch (err) {
    logError("🚨 General error: " + err.message);
  }
};

run();
