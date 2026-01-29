const path = require("path");
const fs = require("fs");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize, splat, align } = format;

const logFormat = printf(({ timestamp, level, message, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata, null, 2)}`;
  }
  return msg;
});

// Log directory: use LOG_DIR env (e.g. Railway volume /app/logs) or default server/logs
const logsDir = process.env.LOG_DIR || path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logger = createLogger({
  level: "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    align(),
    splat(),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        align(),
        splat(),
        logFormat
      ),
    }),
    new transports.File({
      filename: path.join(logsDir, "app.log"),
    }),
  ],
});

module.exports = logger;
