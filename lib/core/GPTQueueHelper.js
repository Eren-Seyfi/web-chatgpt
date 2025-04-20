// Import helper utilities
import { delay } from "../utils/delay.js"; // Delay function
import { generateImage } from "../features/DalleImage.js"; // DALL·E image generation
import { logInfo, logError } from "../utils/logger.js"; // Logging utilities

/**
 * 🔁 Queue-based image generation with retry support and optional fallback description
 *
 * @param {object} page - Puppeteer page instance (ChatGPT web page)
 * @param {Array} items - Array of generation tasks:
 *   {
 *     prompt: "neon teddy bear",     // Prompt for image generation
 *     output: "bear.png",            // Output file name
 *     retry: 3,                      // Maximum number of retry attempts
 *     retryDelay: 2000,              // Initial delay between retries (ms)
 *     backoff: true,                 // Double the delay after each failure
 *     describeInstead: true          // Use fallback description if all retries fail
 *   }
 * @param {function} fallbackDescribeFn - (optional) Fallback function to generate text description if image fails
 */
export async function queueImageWithRetry(
  page,
  items = [],
  fallbackDescribeFn = null
) {
  for (const item of items) {
    const {
      prompt,
      output,
      retry = 1,
      retryDelay = 2000,
      backoff = false,
      describeInstead = false,
    } = item;

    let success = false;
    let currentDelay = retryDelay;

    for (let attempt = 1; attempt <= retry; attempt++) {
      logInfo(`🔁 Attempt ${attempt}/${retry} → "${prompt}"`);

      const result = await generateImage(page, prompt, output, true);
      if (result === true) {
        success = true;
        break;
      }

      if (attempt < retry) {
        logInfo(`🕐 Retrying in ${currentDelay}ms...`);
        await delay(currentDelay);
        if (backoff) currentDelay *= 2;
      }
    }

    if (!success) {
      logError(`❌ All attempts failed for: "${prompt}"`);

      if (describeInstead && typeof fallbackDescribeFn === "function") {
        logInfo("💡 Generating fallback text description...");
        try {
          await fallbackDescribeFn(prompt);
        } catch (e) {
          logError(
            "⚠️ Error while generating fallback description: " + e.message
          );
        }
      }
    }

    // Wait before processing the next item
    await delay(2000);
  }
}
