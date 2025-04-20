// Used for making HTTPS requests and downloading data
import https from "https";

// Logging and delay utilities
import { logInfo, logSuccess, logError } from "../utils/logger.js";
import { delay } from "../utils/delay.js";

/**
 * Generates an image using ChatGPT and returns the result as a base64-encoded string.
 *
 * @param {object} page - Puppeteer Page instance
 * @param {string} prompt - Prompt description for image generation
 * @returns {Promise<string|null>} - Base64 image string (data URI), or null on failure
 */
export async function generateImageBase64(page, prompt) {
  logInfo(`🎨 (Base64) Generating image for: "${prompt}"`);

  // Type the prompt into the ChatGPT textarea
  await page.waitForSelector("textarea", { timeout: 30000 });
  await page.type("textarea", `Generate an image of: ${prompt}`);

  // Wait for the submit button to be enabled, then click it
  await page.waitForSelector("#composer-submit-button:not([disabled])");
  await page.click("#composer-submit-button");

  logInfo("🖌️ Request sent. Waiting for the image to be generated...");

  let imageUrl = null;
  const maxTries = 90;

  // Retry loop: check every second for the image URL
  for (let i = 0; i < maxTries; i++) {
    const result = await page.evaluate(() => {
      const img = document.querySelector('img[alt="Generated image"]');
      return img?.src?.startsWith("http") ? img.src : null;
    });

    if (result) {
      imageUrl = result;
      break;
    }

    await delay(1000);
  }

  if (!imageUrl) {
    logError("❌ Failed to generate image. No URL was found.");
    return null;
  }

  logSuccess("✅ Image URL found. Downloading as base64...");

  return await downloadImageAsBase64(imageUrl);
}

/**
 * Downloads an image from a URL and converts it to a base64 data URI string.
 *
 * @param {string} url - The URL of the image to download
 * @returns {Promise<string>} - Base64-encoded image in data URI format
 */
function downloadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const data = [];
        res.on("data", (chunk) => data.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(data);
          const base64 = buffer.toString("base64");
          resolve(`data:image/png;base64,${base64}`);
        });
      })
      .on("error", (err) => {
        logError("❌ Failed to download image: " + err.message);
        reject(err);
      });
  });
}
