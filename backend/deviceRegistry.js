const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const registryPath = path.join(__dirname, "data", "device-registry.enc");

function getEncryptionKey() {
  const secret = process.env.DEVICE_REGISTRY_KEY || process.env.JWT_SECRET;
  if (!secret) throw new Error("DEVICE_REGISTRY_KEY or JWT_SECRET must be configured");
  return crypto.createHash("sha256").update(secret).digest();
}

function readDeviceIds() {
  if (!fs.existsSync(registryPath)) return new Set();
  const encrypted = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(encrypted.iv, "base64"));
  // console.log(decipher)
  decipher.setAuthTag(Buffer.from(encrypted.tag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(encrypted.data, "base64")),
    decipher.final(),
  ]);
  // console.log(JSON.parse(plaintext.toString("utf8")).deviceIds)
  return new Set(JSON.parse(plaintext.toString("utf8")).deviceIds || []);
}

function readRegistry() {
  if (!fs.existsSync(registryPath)) return { deviceIds: [], connections: {} };
  const encrypted = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(encrypted.iv, "base64"));
  decipher.setAuthTag(Buffer.from(encrypted.tag, "base64"));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(encrypted.data, "base64")), decipher.final()]);
  const registry = JSON.parse(plaintext.toString("utf8"));
  return { deviceIds: registry.deviceIds || [], connections: registry.connections || {} };
}

function writeDeviceIds(deviceIds) {
  return writeRegistry({ deviceIds: [...deviceIds], connections: {} });
}

function writeRegistry(registry) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const plaintext = JSON.stringify(registry);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const payload = JSON.stringify({
    version: 1,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: encrypted.toString("base64"),
  });

  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  const temporaryPath = `${registryPath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, payload, { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temporaryPath, registryPath);
}

function registerOneTimeDeviceId(deviceId) {
  const registry = readRegistry();
  const deviceIds = new Set(registry.deviceIds);
  if (deviceIds.has(deviceId)) return false;
  deviceIds.add(deviceId);

  writeRegistry({ ...registry, deviceIds: [...deviceIds] });
  return true;
}

function createOneTimeDeviceId() {
  let deviceId;
  do {
    deviceId = crypto.randomUUID();
  } while (!registerOneTimeDeviceId(deviceId));

  return deviceId;
}

function hasDeviceId(deviceId) {
  return readDeviceIds().has(deviceId);
}

function connectDevices(firstDeviceId, secondDeviceId) {
  const registry = readRegistry();
  const connections = registry.connections || {};
  connections[firstDeviceId] = Array.from(new Set([...(connections[firstDeviceId] || []), secondDeviceId]));
  connections[secondDeviceId] = Array.from(new Set([...(connections[secondDeviceId] || []), firstDeviceId]));
  writeRegistry({ ...registry, connections });
  return true;
}

function getConnectedDeviceIds(deviceId) {
  return (readRegistry().connections || {})[deviceId] || [];
}

function removeConnection(ownerDeviceId, contactDeviceId) {
  const registry = readRegistry();
  const connections = registry.connections || {};
  connections[ownerDeviceId] = (connections[ownerDeviceId] || []).filter((id) => id !== contactDeviceId);
  writeRegistry({ ...registry, connections });
}

module.exports = { createOneTimeDeviceId, hasDeviceId, connectDevices, getConnectedDeviceIds, removeConnection };
