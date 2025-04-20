// Import helper modules
import { delay } from "../utils/delay.js"; // Delay utility
import { logInfo } from "../utils/logger.js"; // Logging utility

/**
 * Sends a message to the ChatGPT interface and waits for the response to complete.
 * These functions are typically used together in a conversation flow.
 */

/**
 * Types a message into the ChatGPT message box and clicks the send button.
 * @param {object} page - Puppeteer Page instance
 * @param {string} message - The message content to send
 */
export async function sendMessage(page, message) {
  // Wait for the textarea to be available (up to 45 seconds)
  await page.waitForSelector("textarea", { timeout: 45000 });

  // Clear any existing content in the textarea
  await page.evaluate(() => {
    const textarea = document.querySelector("textarea");
    if (textarea) textarea.value = "";
  });

  // Type the new message into the textarea
  await page.type("textarea", message);

  // Wait until the submit button is enabled
  await page.waitForSelector("#composer-submit-button:not([disabled])");

  // Simulate a short user-like delay before clicking
  await delay(300);

  // Click the submit button
  await page.click("#composer-submit-button");

  // Log the action
  logInfo("📨 Message sent.");
}

/**
 * Waits for ChatGPT to finish generating the response.
 * @param {object} page - Puppeteer Page instance
 */
export async function waitForResponseEnd(page) {
  // Wait for the stop button to appear, indicating a response is in progress
  await page.waitForSelector(
    '#composer-submit-button[data-testid="stop-button"]',
    { timeout: 10000 } // Fail after 10 seconds if not found
  );

  // Log status
  logInfo("⏳ Waiting for response...");

  // Wait until:
  // - the stop button disappears
  // - the speech button (audio response) becomes visible
  await page.waitForFunction(
    () => {
      const stop = document.querySelector(
        '#composer-submit-button[data-testid="stop-button"]'
      );
      const speech = document.querySelector(
        '[data-testid="composer-speech-button"]'
      );
      return !stop && !!speech;
    },
    { timeout: 60000 } // Max wait time: 60 seconds
  );

  // Log status
  logInfo("✅ Response completed.");
}
