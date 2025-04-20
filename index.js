// Required modules
import Bot from "./lib/core/Bot.js"; // Main Puppeteer-powered bot class
import { generateImage } from "./lib/features/DalleImage.js"; // DALL·E image generation (file)
import { generateImageBase64 } from "./lib/features/DalleImageBase64.js"; // DALL·E image generation (base64)
import { queueImageWithRetry } from "./lib/core/GPTQueueHelper.js"; // Queue-based generation with retry/fallback
import { logError, logInfo } from "./lib/utils/logger.js"; // Logging utilities
import { delay } from "./lib/utils/delay.js"; // Delay function

/**
 * Initializes and returns an interface for interacting with ChatGPT.
 * Provides methods for chat, image generation, and queued image processing.
 *
 * @param {object} config - Configuration for the bot
 * @returns {Promise<object>} - Object containing chat, image, imageBase64, describe, queueImage, and close functions
 */
export async function createChatGPT(config = {}) {
  // Create and configure the bot instance
  const bot = new Bot({
    model: config.model || "gpt-4",
    stealth: config.stealth !== false,
    fingerprint: config.fingerprint !== false,
    headless: config.headless !== false,
    language: config.language || "en-US",
    proxy: config.proxy || { enabled: false, server: "" },
    useSavedCookies: config.useSavedCookies !== false,
    cookiePath: config.cookiePath || "sessions/cookies.json",
  });

  // Initialize the bot (launch browser and attempt login)
  const isReady = await bot.init();

  if (!isReady) {
    await bot.close();
    logError("Login failed.");
    throw new Error("Login failed.");
  }

  return {
    // Send messages and receive replies
    chat: async (messages) => await bot.chat(messages),

    // Generate an image and save as a file
    image: async (prompt, outputPath = "output.png") => {
      const result = await generateImage(bot.page, prompt, outputPath);
      return result;
    },

    // Generate an image and return as base64 string
    imageBase64: async (prompt) => {
      const base64 = await generateImageBase64(bot.page, prompt);
      return base64;
    },

    // Request a textual description of a prompt instead of an image
    describe: async (prompt) => {
      logInfo(`📝 Requesting descriptive explanation for: ${prompt}`);

      await bot.page.waitForSelector("textarea", { timeout: 30000 });
      await bot.page.type(
        "textarea",
        `Please write a detailed description of the following scene: ${prompt}`
      );
      await bot.page.waitForSelector("#composer-submit-button:not([disabled])");
      await bot.page.click("#composer-submit-button");

      logInfo("💬 Waiting for description...");

      await bot.page.waitForFunction(
        () => {
          const stop = document.querySelector(
            '#composer-submit-button[data-testid="stop-button"]'
          );
          const speech = document.querySelector(
            '[data-testid="composer-speech-button"]'
          );
          return !stop && !!speech;
        },
        { timeout: 60000 }
      );

      const response = await bot.page.evaluate(() => {
        const blocks = document.querySelectorAll(".markdown");
        const last = blocks[blocks.length - 1];
        return last?.innerText || "No description was received.";
      });

      logInfo("🧠 Description:\n" + response);
    },

    // Sequentially generate images from prompts with retry and fallback
    queueImage: async (items = []) => {
      await queueImageWithRetry(bot.page, items, async (prompt) => {
        await bot.page.bringToFront();
        await delay(1000);

        await bot.page.evaluate(() => {
          const textarea = document.querySelector("textarea");
          if (textarea) textarea.value = "";
        });

        await delay(500);

        await bot.page.type(
          "textarea",
          `Please write a detailed description of the following scene: ${prompt}`
        );

        await bot.page.waitForSelector(
          "#composer-submit-button:not([disabled])"
        );
        await bot.page.click("#composer-submit-button");

        await bot.page.waitForFunction(
          () => {
            const stop = document.querySelector(
              '#composer-submit-button[data-testid="stop-button"]'
            );
            const speech = document.querySelector(
              '[data-testid="composer-speech-button"]'
            );
            return !stop && !!speech;
          },
          { timeout: 60000 }
        );

        const description = await bot.page.evaluate(() => {
          const blocks = document.querySelectorAll(".markdown");
          const last = blocks[blocks.length - 1];
          return last?.innerText || "No description was received.";
        });

        logInfo("🧠 Description:\n" + description);
      });
    },

    // Gracefully close the browser
    close: async () => await bot.close(),
  };
}
