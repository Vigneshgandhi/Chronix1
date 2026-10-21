const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { encrypt, decrypt } = require("./enc-dec");
const MESSAGES_DIR = path.join(__dirname, "data", "messages");

/**
 * Get the path for a specific chat's message file.
 * Chat IDs are hashed to avoid filesystem issues with special characters.
 */
function getChatFilePath(chatId) {
  const hash = crypto.createHash("sha256").update(String(chatId)).digest("hex");
  return path.join(MESSAGES_DIR, `${hash}.json`);
}

/**
 * Ensure the messages directory exists.
 */
function ensureMessagesDir() {
  fs.mkdirSync(MESSAGES_DIR, { recursive: true });
}

/**
 * Store a message persistently on the server filesystem.
 * Messages are appended to a JSON array file per chat room.
 */
async function storeMessage(message) {
  if (!message || !message.chatId || typeof message.encryptedMessage !== "string" || typeof message.encryptedMessageKey !== "string") return false;

  try {
    ensureMessagesDir();
    const filePath = getChatFilePath(message.chatId);
    const timestamp = Number(message.timestamp) || Date.now();
    const storedMessage = {
      id: message.id || `${message.senderDeviceId || "unknown"}-${timestamp}`,
      chatId: String(message.chatId),
      senderDeviceId: message.senderDeviceId || "",
      receiverDeviceId: message.receiverDeviceId || "",
      encryptedMessage: message.encryptedMessage,
      encryptedMessageKey: message.encryptedMessageKey,
      iv: message.iv,
      authTag: message.authTag,
      timestamp,
      encryptionVersion: message.encryptionVersion || 1,
      type: message.type || "received",
      pinned: Boolean(message.pinned),
      deletedFor: Array.isArray(message.deletedFor) ? message.deletedFor : [],
    };

    // Read existing messages for this chat
    let messages = [];
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf8");
        messages = JSON.parse(raw);
        if (!Array.isArray(messages)) messages = [];
      } catch {
        messages = [];
      }
    }

    // Append new message
    messages.push(encrypt(storedMessage));
    console.log(`[MessageStore] Storing message ${storedMessage.id} for chat ${message.receiverDeviceId}`);

    // Write back to file (atomic write with temp file)
    const temporaryPath = `${filePath}.${process.pid}.tmp`;
    fs.writeFileSync(temporaryPath, JSON.stringify(messages, null, 2), {
      encoding: "utf8",
      mode: 0o600,
    });
    fs.renameSync(temporaryPath, filePath);

    console.log(`[MessageStore] Saved message ${storedMessage.id} for chat ${message.chatId}`);
    return true;
  } catch (error) {
    console.error("[MessageStore] Failed to store message:", error);
    return false;
  }
}

async function updateMessage(chatId, messageId, actorDeviceId, updates = {}) {
  const filePath = getChatFilePath(chatId);
  if (!fs.existsSync(filePath)) return { success: false, error: "Message not found" };
  let encryptedMessages;
  try { encryptedMessages = JSON.parse(fs.readFileSync(filePath, "utf8")); } catch { return { success: false, error: "Message not found" }; }
  const messages = encryptedMessages.map((item) => { try { return decrypt(item); } catch { return null; } });
  const index = messages.findIndex((item) => item && String(item.id) === String(messageId));
  if (index < 0) return { success: false, error: "Message not found" };
  const current = messages[index];
  if (updates.pinned !== undefined) current.pinned = Boolean(updates.pinned);
  if (updates.text !== undefined || updates.files !== undefined) return { success: false, error: "Encrypted message content cannot be edited on the server." };
  if (updates.deletedFor) current.deletedFor = [...new Set(updates.deletedFor)];
  if (updates.moderationStatus !== undefined) current.moderationStatus = updates.moderationStatus;
  if (updates.moderationCategory !== undefined) current.moderationCategory = updates.moderationCategory;
  if (updates.moderationSeverity !== undefined) current.moderationSeverity = updates.moderationSeverity;
  if (updates.moderationConfidence !== undefined) current.moderationConfidence = updates.moderationConfidence;
  if (updates.moderationAction !== undefined) current.moderationAction = updates.moderationAction;
  if (updates.moderationReportId !== undefined) current.moderationReportId = updates.moderationReportId;
  if (updates.removedAt !== undefined) current.removedAt = updates.removedAt;
  if (updates.removalReason !== undefined) current.removalReason = String(updates.removalReason);
  messages[index] = current;
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(messages.map(encrypt), null, 2), { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temporaryPath, filePath);
  return { success: true, message: current };
}

async function removeMessages(chatId, messageIds = []) {
  const filePath = getChatFilePath(chatId);
  if (!fs.existsSync(filePath)) return { success: false, error: "Message not found" };
  const ids = new Set(messageIds.map(String));
  try {
    const encryptedMessages = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const remaining = encryptedMessages.filter((encrypted) => {
      try { return !ids.has(String(decrypt(encrypted).id)); } catch { return true; }
    });
    const temporaryPath = `${filePath}.${process.pid}.tmp`;
    fs.writeFileSync(temporaryPath, JSON.stringify(remaining, null, 2), { encoding: "utf8", mode: 0o600 });
    fs.renameSync(temporaryPath, filePath);
    return { success: true, removed: encryptedMessages.length - remaining.length };
  } catch (error) {
    console.error("[MessageStore] Failed to remove moderated messages:", error);
    return { success: false, error: "Unable to remove message" };
  }
}

/**
 * Retrieve all stored messages for a specific chat room.
 */
async function getMessages(chatId) {
  if (!chatId) return [];

  try {
    const filePath = getChatFilePath(chatId);

    if (!fs.existsSync(filePath)) return [];

    const raw = fs.readFileSync(filePath, "utf8");
    const messages = JSON.parse(raw);

    if (!Array.isArray(messages)) return [];

    return messages.map((msg) => {
      try {
        return decrypt(msg);
      } catch {
        return null; // Skip corrupted messages
      }
    }).filter((message) => message && typeof message.encryptedMessage === "string" && typeof message.encryptedMessageKey === "string");
  } catch (error) {
    console.error("[MessageStore] Failed to read messages:", error);
    return [];
  }
}

/**
 * Retrieve all messages across all chats.
 * Returns an object keyed by chatId.
 */
async function getAllMessages() {
  try {
    ensureMessagesDir();
    const files = fs.readdirSync(MESSAGES_DIR);
    const allMessages = {};

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      try {
        const filePath = path.join(MESSAGES_DIR, file);
        const raw = fs.readFileSync(filePath, "utf8");
        const messages = JSON.parse(raw);

        if (Array.isArray(messages) && messages.length > 0) {
          const decryptedMessages = messages.map((message) => { try { return decrypt(message); } catch { return null; } }).filter((message) => message && typeof message.encryptedMessage === "string");
          const chatId = decryptedMessages[0]?.chatId;
          if (chatId) allMessages[chatId] = decryptedMessages;
        }
      } catch {
        // Skip corrupted files
        continue;
      }
    }

    return allMessages;
  } catch (error) {
    console.error("[MessageStore] Failed to read all messages:", error);
    return {};
  }
}

/**
 * Get all chat IDs that have stored messages.
 */
async function getAllChatIds() {
  try {
    ensureMessagesDir();
    const files = fs.readdirSync(MESSAGES_DIR);
    const chatIds = [];

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      try {
        const filePath = path.join(MESSAGES_DIR, file);
        const raw = fs.readFileSync(filePath, "utf8");
        const encryptedMessages = JSON.parse(raw);

        if (!Array.isArray(encryptedMessages) || encryptedMessages.length === 0) continue;
        const firstMessage = decrypt(encryptedMessages[0]);
        if (firstMessage.chatId && typeof firstMessage.encryptedMessage === "string") chatIds.push(firstMessage.chatId);
      } catch {
        continue;
      }
    }

    return chatIds;
  } catch (error) {
    console.error("[MessageStore] Failed to get chat IDs:", error);
    return [];
  }
}

async function clearAllMessages() {
  try {
    ensureMessagesDir();
    const files = fs.readdirSync(MESSAGES_DIR);

    for (const file of files) {
      if (file.endsWith(".json")) {
        fs.unlinkSync(path.join(MESSAGES_DIR, file));
      }
    }

    console.log("[MessageStore] All messages cleared");
    return true;
  } catch (error) {
    console.error("[MessageStore] Failed to clear messages:", error);
    return false;
  }
}

module.exports = {
  storeMessage,
  getMessages,
  getAllMessages,
  getAllChatIds,
  clearAllMessages,
  updateMessage,
  removeMessages,
};
