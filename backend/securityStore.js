const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { encrypt, decrypt } = require("./enc-dec");

const filePath = path.join(__dirname, "data", "security-records.enc");

function read() {
  if (!fs.existsSync(filePath)) return {};
  try { return decrypt(JSON.parse(fs.readFileSync(filePath, "utf8"))); } catch { return {}; }
}

function write(records) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(encrypt(records)), { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temporaryPath, filePath);
}

function get(deviceId) {
  return read()[deviceId] || null;
}

function create(deviceId, record) {
  const records = read();
  if (records[deviceId]) return false;
  records[deviceId] = { publicKey: record.publicKey, passwordSalt: record.passwordSalt, passwordVerifier: record.passwordVerifier, encryptionVersion: record.encryptionVersion || 1, createdAt: Date.now() };
  write(records);
  return true;
}

function updatePublicKey(deviceId, publicKey) {
  const records = read();
  if (!records[deviceId]) return false;
  records[deviceId].publicKey = publicKey;
  write(records);
  return true;
}

module.exports = { get, create, updatePublicKey };
