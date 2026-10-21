const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { encrypt, decrypt } = require("./enc-dec");

const file = path.join(__dirname, "data", "profiles.json");
function read() {
  if (!fs.existsSync(file)) return {};
  try { return decrypt(JSON.parse(fs.readFileSync(file, "utf8"))); } catch { return {}; }
}
function save(deviceId, profile) {
  const profiles = read();
  profiles[crypto.createHash("sha256").update(deviceId).digest("hex")] = profile;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(encrypt(profiles)), { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temp, file);
}
function get(deviceId) {
  return read()[crypto.createHash("sha256").update(deviceId).digest("hex")];
}
module.exports = { save, get };
