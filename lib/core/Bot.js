// Helper function for launching the browser and initializing a new page
import { launchBrowser } from "./BrowserManager.js";

// Helper functions for loading and saving cookies
import { loadCookies, saveCookies } from "./SessionManager.js";

// Feature module that handles sending messages and receiving responses
import { handleChat } from "../features/ChatFeature.js";

// Bot class definition
export default class Bot {
  // Constructor receives configuration options (e.g., model, proxy, headless, cookiePath)
  constructor(config) {
    this.config = config;
  }

  // Initializes the browser and performs required checks
  async init() {
    // Launch the browser and create a new page
    const { browser, page } = await launchBrowser(this.config);
    this.browser = browser;
    this.page = page;

    // Load previously saved cookies, if any
    await loadCookies(this.page, this.config.cookiePath);

    // Navigate to ChatGPT's web interface with the selected model
    await this.page.goto(
      `https://chat.openai.com/?model=${this.config.model}`,
      {
        waitUntil: "domcontentloaded", // Continue after DOM content is fully loaded
      }
    );

    // If Cloudflare protection is detected, wait for the challenge to complete
    const cf = await this.page.$("#challenge-form");
    if (cf) {
      console.log(
        "☁️ Cloudflare challenge detected. Waiting for verification..."
      );
      await this.page.waitForFunction(
        () => !document.querySelector("#challenge-form"),
        {
          timeout: 30000,
        }
      );
    }

    // Check if the user is already logged in (look for the textarea element)
    const loggedIn = (await this.page.$("textarea")) !== null;
    if (!loggedIn) {
      console.log("❌ Not logged in. Please sign in to continue.");
      return false;
    }

    return true; // Initialization successful
  }

  // Chat function — sends prompts and returns responses
  async chat(messages = []) {
    // Send the prompts and receive responses using the handler
    const results = await handleChat(this.page, messages);

    // Save updated session cookies
    await saveCookies(this.page, this.config.cookiePath);

    return results;
  }

  // Gracefully close the browser instance
  async close() {
    await this.browser?.close();
  }
}
