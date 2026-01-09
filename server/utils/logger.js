const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize, splat, align } = format;

const logFormat = printf(({ timestamp, level, message, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata, null, 2)}`;
  }
  return msg;
});

const logger = createLogger({
  level: "debug", // You can switch to 'info' or 'warn' in production
  format: combine(
    colorize({ all: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    align(),
    splat(),
    logFormat
  ),
  transports: [
    new transports.Console(),
    // Optionally add a file transport in production:
    // new transports.File({ filename: 'logs/app.log' })
  ],
});

module.exports = logger;
