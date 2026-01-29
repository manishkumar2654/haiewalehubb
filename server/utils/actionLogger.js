/**
 * Professional action logger – who did what, when.
 * Format: [TIMESTAMP] [CATEGORY] ACTION | user: email | details
 */
const logger = require("./logger");

const timestamp = () => {
  const now = new Date();
  return now.toISOString().replace("T", " ").slice(0, 19);
};

/**
 * Log an action with user identity and optional details.
 * @param {string} category - e.g. AUTH, WALKIN, SERVICE, PRODUCT, USER
 * @param {string} action - e.g. LOGIN_SUCCESS, CREATE, UPDATE, DELETE
 * @param {object} userOrEmail - req.user object or { email } or email string
 * @param {object} details - optional key-value details (ids, counts, etc.)
 */
function logAction(category, action, userOrEmail, details = {}) {
  const ts = timestamp();
  let email = "anonymous";
  if (userOrEmail) {
    if (typeof userOrEmail === "string") email = userOrEmail;
    else if (userOrEmail.email) email = userOrEmail.email;
  }
  const detailStr =
    Object.keys(details).length === 0
      ? ""
      : " | " +
        Object.entries(details)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
  const line = `[${ts}] [${category}] ${action} | user: ${email}${detailStr}`;
  logger.info(line);
}

module.exports = { logAction, timestamp };
