/**
 * Logs every API request when it finishes: method, path, status, user email.
 * Runs for /api/v1 so we see who did what without changing route behavior.
 */
const logger = require("../utils/logger");

const timestamp = () => {
  const now = new Date();
  return now.toISOString().replace("T", " ").slice(0, 19);
};

function requestLogger(req, res, next) {
  res.on("finish", () => {
    const ts = timestamp();
    const method = req.method;
    const path = req.originalUrl || req.url;
    const status = res.statusCode;
    const email = req.user?.email || "anonymous";
    const line = `[${ts}] [API] ${method} ${path} | user: ${email} | status: ${status}`;
    logger.info(line);
  });
  next();
}

module.exports = requestLogger;
