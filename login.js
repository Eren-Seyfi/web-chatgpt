// Import puppeteer-extra and the stealth plugin
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Import file system and path modules
import fs from "fs-extra";
import path from "path";

// Import utility functions
import { delay } from "./lib/utils/delay.js";
import { logInfo, logSuccess } from "./lib/utils/logger.js";

// Enable stealth plugin to reduce bot detection
puppeteer.use(StealthPlugin());

// Define the path where cookies will be saved
const COOKIE_PATH = path.resolve("sessions/cookies.json");

// Launch the browser with recommended arguments
const browser = await puppeteer.launch({
  headless: false, // Run in visible mode so user can log in
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-blink-features=AutomationControlled", // Reduce automation detection
    "--disable-infobars", // Hide “Chrome is being controlled...” message
    "--ignore-certificate-errors",
    "--ignore-certificate-errors-spki-list",
    "--proxy-bypass-list=*",
    "--incognito",
    "--start-maximized",
  ],
  defaultViewport: null,
});

// Open a new page
const page = await browser.newPage();

// Navigate to ChatGPT login page
await page.goto("https://chat.openai.com", { waitUntil: "networkidle2" });

// Prompt user to log in manually
logInfo("🔐 Please log in to ChatGPT manually in the opened browser...");
logInfo("Once logged in, return to the terminal and press ENTER to continue.");

// Wait for user to press ENTER, then save cookies
process.stdin.once("data", async () => {
  await delay(1000); // Small delay to ensure login is complete
  const cookies = await page.cookies(); // Retrieve browser cookies
  await fs.ensureDir(path.dirname(COOKIE_PATH)); // Ensure the target folder exists
  await fs.writeJson(COOKIE_PATH, cookies, { spaces: 2 }); // Save cookies as JSON
  logSuccess("✅ Cookies have been saved successfully.");
  await browser.close(); // Close the browser
  process.exit(0); // Exit script
});
