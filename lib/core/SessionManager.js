// Import fs-extra for file system operations
import fs from "fs-extra";

/**
 * Loads cookies from a JSON file and sets them in the browser.
 * @param {object} page - Puppeteer Page instance
 * @param {string} path - Path to the JSON file containing cookies
 */
export async function loadCookies(page, path) {
  // Check if the cookie file exists
  if (await fs.pathExists(path)) {
    try {
      // Read cookies from JSON file
      const cookies = await fs.readJson(path);

      // Apply cookies to the page
      await page.setCookie(...cookies);
    } catch {
      // If reading fails (e.g., corrupted file), remove the file
      await fs.remove(path);
    }
  }
}

/**
 * Retrieves cookies from the current browser page and saves them as JSON.
 * @param {object} page - Puppeteer Page instance
 * @param {string} path - Path to the file where cookies will be saved
 */
export async function saveCookies(page, path) {
  // Get cookies from the page
  const cookies = await page.cookies();

  // Save cookies to file in JSON format (overwrite if exists)
  await fs.outputJson(path, cookies, { spaces: 2 });
}
