const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { encrypt, decrypt } = require("./enc-dec");

const DATA_DIR = path.join(__dirname, "data", "moderation");

function fileFor(name) {
  return path.join(DATA_DIR, `${crypto.createHash("sha256").update(name).digest("hex")}.json`);
}

function read(name, fallback) {
  const file = fileFor(name);
  if (!fs.existsSync(file)) return fallback;
  try { return decrypt(JSON.parse(fs.readFileSync(file, "utf8"))); } catch { return fallback; }
}

function write(name, value) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = fileFor(name);
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(encrypt(value)), { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temp, file);
}

function update(name, fallback, updater) {
  const value = updater(read(name, fallback));
  write(name, value);
  return value;
}

function isBlocked(blocker, blocked) {
  const blocks = read("blocks", {});
  return Array.isArray(blocks[blocker]) && blocks[blocker].includes(blocked);
}

function setBlock(blocker, blocked, value) {
  return update("blocks", {}, (blocks) => {
    const list = new Set(blocks[blocker] || []);
    value ? list.add(blocked) : list.delete(blocked);
    blocks[blocker] = [...list];
    return blocks;
  });
}

function listBlocks() {
  return read("blocks", {});
}

function createRecord(type, record, prefix = type) {
  const id = `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
  update(type, [], (records) => [...records, { ...record, id }]);
  return id;
}

function listRecords(type) {
  return read(type, []);
}

function updateRecord(type, id, updates) {
  let updated = null;
  update(type, [], (records) => records.map((record) => {
    if (record.id !== id) return record;
    updated = { ...record, ...updates, updatedAt: Date.now() };
    return updated;
  }));
  return updated;
}

function getRecord(type, id) {
  return read(type, []).find((record) => record.id === id) || null;
}

module.exports = { isBlocked, setBlock, listBlocks, createRecord, listRecords, getRecord, updateRecord };
