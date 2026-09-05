const fs = require("fs");
const path = require("path");

// All user records live in this single JSON file instead of a database table.
const DB_PATH = path.join(__dirname, "../data/users.json");

/**
 * Make sure the data folder and the users.json file exist.
 * If the file is missing (first run, fresh clone, etc.) it is created
 * with an empty array so the rest of the app can rely on it always existing.
 */
function ensureFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2), "utf8");
  }
}

/**
 * Read all users from the JSON file.
 * Returns an array (empty array if the file is empty/corrupted).
 */
function readUsers() {
  ensureFile();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Failed to read users.json:", err.message);
    return [];
  }
}

/**
 * Persist the full users array back to the JSON file.
 */
function writeUsers(users) {
  ensureFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), "utf8");
}

/**
 * Simple auto-increment helper, mimicking a SQL AUTO_INCREMENT id.
 */
function getNextId(users) {
  if (!users.length) return 1;
  return Math.max(...users.map((u) => u.id || 0)) + 1;
}

module.exports = { readUsers, writeUsers, getNextId, DB_PATH };
