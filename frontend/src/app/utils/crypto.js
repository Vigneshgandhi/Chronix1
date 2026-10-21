import { scrypt } from "scrypt-js";

const DB_NAME = "chronix";
const STORE_NAME = "device-settings";
const SECURITY_KEY = "chronix-security";
const ENCRYPTION_VERSION = 1;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, dkLen: 32 };

function bytesToBase64(bytes) {
  let binary = "";
  new Uint8Array(bytes).forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

function joinBytes(...parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => { result.set(part, offset); offset += part.length; });
  return result;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 3);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getSecurityRecord() {
  const database = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(SECURITY_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}

export async function storeSecurityRecord(record) {
  const database = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(record, SECURITY_KEY);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

async function derivePasswordKey(password, salt) {
  const derived = await scrypt(new TextEncoder().encode(password), base64ToBytes(salt), SCRYPT_PARAMS.N, SCRYPT_PARAMS.r, SCRYPT_PARAMS.p, SCRYPT_PARAMS.dkLen);
  return crypto.subtle.importKey("raw", derived, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function verifierFor(derivedKeyBytes) {
  const digest = await crypto.subtle.digest("SHA-256", new Uint8Array(derivedKeyBytes));
  return bytesToBase64(digest);
}

async function encryptPrivateKey(privateJwk, password, salt) {
  const saltBytes = base64ToBytes(salt);
  const derived = await scrypt(new TextEncoder().encode(password), saltBytes, SCRYPT_PARAMS.N, SCRYPT_PARAMS.r, SCRYPT_PARAMS.p, SCRYPT_PARAMS.dkLen);
  const key = await crypto.subtle.importKey("raw", derived, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(privateJwk)));
  return { iv: bytesToBase64(iv), ciphertext: bytesToBase64(ciphertext), verifier: await verifierFor(derived) };
}

async function decryptPrivateKey(record, password) {
  const saltBytes = base64ToBytes(record.passwordSalt);
  const derived = await scrypt(new TextEncoder().encode(password), saltBytes, SCRYPT_PARAMS.N, SCRYPT_PARAMS.r, SCRYPT_PARAMS.p, SCRYPT_PARAMS.dkLen);
  if (await verifierFor(derived) !== record.passwordVerifier) throw new Error("Incorrect security password.");
  const key = await crypto.subtle.importKey("raw", derived, "AES-GCM", false, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(record.privateKeyIv) }, key, base64ToBytes(record.encryptedPrivateKey));
  return crypto.subtle.importKey("jwk", JSON.parse(new TextDecoder().decode(plaintext)), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]);
}

export async function createSecuritySetup(password) {
  if (typeof password !== "string" || password.length < 12) throw new Error("Use a password with at least 12 characters.");
  const keyPair = await crypto.subtle.generateKey({ name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["encrypt", "decrypt"]);
  const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  const salt = bytesToBase64(crypto.getRandomValues(new Uint8Array(16)));
  const encrypted = await encryptPrivateKey(privateJwk, password, salt);
  return {
    publicKey: publicJwk,
    passwordSalt: salt,
    passwordVerifier: encrypted.verifier,
    privateKeyIv: encrypted.iv,
    encryptedPrivateKey: encrypted.ciphertext,
    encryptionVersion: ENCRYPTION_VERSION,
  };
}

export async function unlockSecurity(record, password) {
  return decryptPrivateKey(record, password);
}

export async function encryptMessage(payload, recipientPublicJwk, senderDeviceId, receiverDeviceId) {
  const recipientKey = await crypto.subtle.importKey("jwk", recipientPublicJwk, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
  const messageKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const encryptedWithTag = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, messageKey, plaintext));
  const encrypted = encryptedWithTag.slice(0, -16);
  const authTag = encryptedWithTag.slice(-16);
  const rawMessageKey = await crypto.subtle.exportKey("raw", messageKey);
  const encryptedMessageKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, recipientKey, rawMessageKey);
  return { encryptedMessage: bytesToBase64(encrypted), encryptedMessageKey: bytesToBase64(encryptedMessageKey), iv: bytesToBase64(iv), authTag: bytesToBase64(authTag), senderDeviceId, receiverDeviceId, encryptionVersion: ENCRYPTION_VERSION };
}

export async function decryptMessage(envelope, privateKey) {
  const rawMessageKey = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, base64ToBytes(envelope.encryptedMessageKey));
  const messageKey = await crypto.subtle.importKey("raw", rawMessageKey, { name: "AES-GCM" }, false, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(envelope.iv) }, messageKey, joinBytes(base64ToBytes(envelope.encryptedMessage), base64ToBytes(envelope.authTag)));
  return JSON.parse(new TextDecoder().decode(plaintext));
}

export async function encryptFile(file, recipientPublicJwk) {
  const recipientKey = await crypto.subtle.importKey("jwk", recipientPublicJwk, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
  const fileKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedWithTag = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, fileKey, await file.arrayBuffer()));
  const encryptedBytes = encryptedWithTag.slice(0, -16);
  const authTag = encryptedWithTag.slice(-16);
  const rawFileKey = await crypto.subtle.exportKey("raw", fileKey);
  const encryptedFileKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, recipientKey, rawFileKey);
  return { bytes: encryptedBytes, encryptedFileKey: bytesToBase64(encryptedFileKey), iv: bytesToBase64(iv), authTag: bytesToBase64(authTag) };
}

export async function decryptFile(file, privateKey) {
  const response = await fetch(file.url);
  if (!response.ok) throw new Error("Unable to retrieve encrypted attachment.");
  const encryptedFileKey = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, base64ToBytes(file.encryptedFileKey));
  const fileKey = await crypto.subtle.importKey("raw", encryptedFileKey, { name: "AES-GCM" }, false, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(file.iv) }, fileKey, joinBytes(new Uint8Array(await response.arrayBuffer()), base64ToBytes(file.authTag)));
  return new Blob([plaintext], { type: file.type || "application/octet-stream" });
}
