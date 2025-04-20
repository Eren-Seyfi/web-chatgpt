import colors from "colors";

// Renkli log çıktısı fonksiyonu
function log(label, message, styleFn = (txt) => txt) {
  console.log(styleFn(`[${label}]`), message);
}

// Hazır log fonksiyonları
export const logInfo = (msg) => log("INFO", msg, colors.cyan);
export const logSuccess = (msg) => log("✔", msg, colors.green);
export const logWarn = (msg) => log("WARN", msg, colors.yellow);
export const logError = (msg) => log("ERROR", msg, colors.red);
export const logDebug = (msg) => log("DEBUG", msg, colors.gray);
export const logStep = (msg) => log("STEP", msg, colors.magenta); // isteğe bağlı

// 🔁 Örnek kullanım:
// logInfo("Sunucu başlatılıyor...");
// logSuccess("Her şey yolunda!");
// logError("Veritabanına bağlanılamadı.");
