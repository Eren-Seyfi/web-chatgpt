import colors from "colors";

/**
 * Generic log formatter with colorized labels.
 *
 * @param {string} label - The label prefix (e.g. INFO, ERROR)
 * @param {string} message - The message content to log
 * @param {function} styleFn - A color function from `colors` (default: no style)
 */
function log(label, message, styleFn = (txt) => txt) {
  console.log(styleFn(`[${label}]`), message);
}

// Predefined colored log functions
export const logInfo = (msg) => log("INFO", msg, colors.cyan);
export const logSuccess = (msg) => log("✔", msg, colors.green);
export const logWarn = (msg) => log("WARN", msg, colors.yellow);
export const logError = (msg) => log("ERROR", msg, colors.red);
export const logDebug = (msg) => log("DEBUG", msg, colors.gray);
export const logStep = (msg) => log("STEP", msg, colors.magenta); // Optional: step-wise process logging

// 🔁 Example usage:
// logInfo("Starting the server...");
// logSuccess("Everything is OK!");
// logError("Failed to connect to the database.");
