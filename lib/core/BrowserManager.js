// Required modules
import puppeteer from "puppeteer-extra"; // Enhanced version of Puppeteer
import StealthPlugin from "puppeteer-extra-plugin-stealth"; // Plugin to bypass bot detection

// Apply stealth plugin to Puppeteer
puppeteer.use(StealthPlugin());

/**
 * Advanced browser launch function
 * @param {Object} options - Launch configuration
 * @param {boolean} options.headless - Whether to run browser in headless mode
 * @param {Object} options.proxy - Proxy configuration { enabled: boolean, server: string }
 * @param {string} options.language - Browser language (e.g., "en-US")
 * @param {boolean} options.fingerprint - Whether to spoof navigator data
 * @returns {Promise<{browser: Browser, page: Page}>}
 */
export async function launchBrowser({
  headless = true, // Headless mode (true = invisible browser)
  proxy = { enabled: false, server: "" }, // Proxy configuration
  language = "en-US", // Browser language
  fingerprint = true, // Enable navigator fingerprint spoofing
}) {
  // Puppeteer launch arguments
  const args = [
    "--no-sandbox", // Disable sandbox (for CI/CD environments)
    "--disable-setuid-sandbox",
    "--disable-blink-features=AutomationControlled", // Hide automation indicators
    "--disable-infobars", // Hide "Chrome is being controlled" message
    "--ignore-certificate-errors", // Ignore SSL errors
    "--ignore-certificate-errors-spki-list",
    "--proxy-bypass-list=*", // Bypass proxy for all sites
    "--incognito", // Open in incognito mode
    "--start-maximized", // Maximize browser window
  ];

  // If proxy is enabled, add proxy server argument
  if (proxy.enabled && proxy.server) {
    args.push(`--proxy-server=${proxy.server}`);
  }

  // Launch the browser with given options
  const browser = await puppeteer.launch({
    headless,
    args,
    defaultViewport: null, // Use screen resolution size
  });

  // Create a new tab
  const page = await browser.newPage();

  // Set Accept-Language HTTP header
  await page.setExtraHTTPHeaders({ "Accept-Language": language });

  // Spoof navigator data to reduce bot detection
  if (fingerprint) {
    await page.evaluateOnNewDocument((lang) => {
      Object.defineProperty(navigator, "language", { get: () => lang });
      Object.defineProperty(navigator, "languages", { get: () => [lang] });
      Object.defineProperty(navigator, "platform", { get: () => "Win32" });
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    }, language);
  }

  // Return the browser and page instances
  return { browser, page };
}
