// Import core logic to send messages and wait for responses
import { sendMessage, waitForResponseEnd } from "../core/PageController.js";

// Import delay utility for small pauses between steps
import { delay } from "../utils/delay.js";

// Logging utilities
import { logInfo, logWarn } from "../utils/logger.js";

/**
 * Sends a list of messages to ChatGPT in order and collects the responses.
 *
 * @param {object} page - Puppeteer Page instance (active ChatGPT page)
 * @param {Array<string>} messages - List of messages/prompts to send
 * @returns {Array<object>} - List of results in the form [{ prompt, content }]
 */
export async function handleChat(page, messages = []) {
  const responses = [];

  for (const prompt of messages) {
    // Log prompt being sent
    logInfo("💬 Sending: " + prompt);

    // Send message to the page
    await sendMessage(page, prompt);

    // Wait until the response is complete
    await waitForResponseEnd(page);

    // Add a small delay to mimic natural pacing and prevent overload
    await delay(500);

    // Extract the latest response content from the page
    const content = await page.evaluate(() => {
      const blocks = document.querySelectorAll(".markdown");
      const last = blocks[blocks.length - 1];
      return last?.innerText?.trim() || "";
    });

    // Handle empty responses gracefully
    if (!content) {
      logWarn("⚠️ Received an empty response. Proceeding...");
      responses.push({
        prompt,
        content: "❌ No response received or empty content returned.",
      });
    } else {
      responses.push({ prompt, content });
    }
  }

  return responses;
}
