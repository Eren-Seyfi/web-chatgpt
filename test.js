import { createChatGPT } from "./index.js";
import { logInfo, logSuccess, logError } from "./lib/utils/logger.js";

const run = async () => {
  try {
    const gpt = await createChatGPT({
      model: "gpt-4",
      headless: false,
      language: "tr-TR",
      stealth: true,
      fingerprint: true,
      proxy: {
        enabled: false,
        server: "",
      },
    });

    // 🎯 1. Chat özelliği
    const chatResponses = await gpt.chat([
      "Merhaba! Nasılsın?",
      "Bana komik bir fıkra anlatır mısın?",
    ]);

    chatResponses.forEach((res, i) => {
      logInfo(`\n📨 Soru ${i + 1}: ${res.prompt}`);
      logSuccess(`🧠 Cevap:\n${res.content}`);
    });

    // 🎯 2. Tek görsel oluştur ve indir (image)
    await gpt.image("ışıklı camdan yapılmış bir ayıcık", "bear.png");

    // 🎯 3. Görseli base64 olarak al
    const base64 = await gpt.imageBase64(
      "mor sisli bir ormanda yüzen kristal kelebek"
    );
    console.log("📷 Base64 (ilk 100 karakter):", base64.slice(0, 100) + "...");

    // 🎯 4. Sıralı görsel üretim (queueImage) + retry + backoff + fallback
    await gpt.queueImage([
      {
        prompt: "neon ayıcık",
        output: "neon-bear.png",
        retry: 3,
        retryDelay: 2000,
        backoff: true,
        describeInstead: true,
      },
      {
        prompt: "uçan pizzacı robot",
        output: "drone.png",
        retry: 2,
        retryDelay: 1000,
        backoff: false,
        describeInstead: true,
      },
    ]);

    await gpt.close();
  } catch (err) {
    logError("🚨 Genel hata: " + err.message);
  }
};

run();
