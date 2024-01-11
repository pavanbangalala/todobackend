const crypto = require("crypto");

const ACCESS_KEY_SECRET = crypto.randomBytes(32).toString("hex");
const REFRESH_KEY_SECRET = crypto.randomBytes(32).toString("hex");

console.table({ ACCESS_KEY_SECRET, REFRESH_KEY_SECRET });
