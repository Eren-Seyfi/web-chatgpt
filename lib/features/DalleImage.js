// Required modules
import fs from "fs"; // File system operations
import https from "https"; // For downloading image via HTTPS
import path from "path"; // (Optional) Path handling
import { logInfo, logSuccess, logError, logWarn } from "../utils/logger.js"; // Logging utilities
import { delay } from "../utils/delay.js"; // Delay utility

/**
 * Sends a prompt to the ChatGPT page to generate an image, then downloads and saves it.
 *
 * @param {object} page - Puppeteer Page instance
 * @param {string} prompt - Prompt to generate the image
 * @param {string} outputPath - Path to save the image (default: output.png)
 * @param {boolean} quiet - If true, suppress logs
 * @returns {boolean} - Returns true if the image was successfully generated and downloaded
 */
export async function generateImage(
  page,
  prompt,
  outputPath = "output.png",
  quiet = false
) {
  if (!quiet) logInfo(`🎨 Generating image for prompt: "${prompt}"`);

  await page.waitForSelector("textarea", { timeout: 30000 });

  await page.type("textarea", `Generate an image of: ${prompt}`);
  await page.waitForSelector("#composer-submit-button:not([disabled])");
  await page.click("#composer-submit-button");

  if (!quiet)
    logInfo("🖌️ Image generation request sent. Waiting for the result...");

  let imageUrl = null;
  const maxTries = 90;

  for (let i = 0; i < maxTries; i++) {
    const result = await page.evaluate(() => {
      const img = document.querySelector('img[alt="Generated image"]');
      return img?.src?.startsWith("http") ? img.src : null;
    });

    if (result) {
      imageUrl = result;
      break;
    }

    const stopped = await page.evaluate(() => {
      const stoppedMsg = document.querySelector("button[disabled] span");
      return stoppedMsg?.innerText?.includes("Stopped creating image");
    });

    if (stopped) {
      logWarn("⚠️ Image generation was stopped by the system.");
      return false;
    }

    await delay(1000);
  }

  if (!imageUrl) {
    logError("❌ Image could not be generated. No URL found.");
    return false;
  }

  logSuccess("✅ Image URL found. Downloading...");

  await downloadImage(imageUrl, outputPath);

  logSuccess(`✅ Image successfully saved to: ${outputPath}`);
  return true;
}

/**
 * Downloads an image from the given URL and saves it to disk.
 *
 * @param {string} url - The image URL to download
 * @param {string} dest - Path where the image will be saved
 * @returns {Promise<void>}
 */
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}
