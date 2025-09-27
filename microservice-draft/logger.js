const { createLogger, format, transports } = require("winston");
const path = require("path");
const fs = require("fs");

// Sørg for at logs/ mappen findes
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.json() // gemmer log som JSON i filen
  ),
  transports: [
    // Console output
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple() // simpelt og farvet i terminalen
      ),
    }),
    // Fil med alle logs
    new transports.File({
      filename: path.join(logDir, "combined.log"),
      level: "info",
    }),
    // Fil kun med errors
    new transports.File({
      filename: path.join(logDir, "errors.log"),
      level: "error",
    }),
  ],
});

module.exports = logger;
