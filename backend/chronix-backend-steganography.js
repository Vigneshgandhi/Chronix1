/**
 * Chronix Backend Steganography Module
 * Hides encrypted message payloads within legitimate-looking data
 * Techniques: LSB encoding, metadata hiding, field obfuscation
 */

const crypto = require('crypto');

/**
 * Steganography Strategy: Hide payload in device profile status message
 * Uses prefix marker and base64 encoding within a plausible status update
 * Example: "Away from desk 🕐📎↕" where hidden chars encode the payload
 */
class ProfileSteganography {
  static MARKER = '🕐'; // Unicode marker that looks innocent

  /**
   * Embed encrypted payload in status message
   * @param {string} originalStatus - Original status message
   * @param {string} encryptedPayload - Base64-encoded encrypted data
   * @returns {string} Status with hidden payload
   */
  static embed(originalStatus, encryptedPayload) {
    // Limit encrypted payload to avoid suspiciously long strings
    if (encryptedPayload.length > 512) {
      throw new Error('Payload too large for profile steganography');
    }

    // Use zero-width Unicode characters to hide binary data
    const zeroWidthChars = ['\u200B', '\u200C', '\u200D']; // ZWS, ZWJ, ZWNJ
    let hidden = '';

    for (let i = 0; i < encryptedPayload.length; i++) {
      const byte = encryptedPayload.charCodeAt(i);
      const binary = byte.toString(2).padStart(8, '0');

      for (let j = 0; j < 8; j++) {
        hidden += zeroWidthChars[parseInt(binary[j]) * 2]; // 0 or 2
      }
    }

    // Append marker + hidden data to original status
    return originalStatus + this.MARKER + hidden;
  }

  /**
   * Extract encrypted payload from status message
   * @param {string} status - Status with embedded payload
   * @returns {string|null} Extracted encrypted payload or null
   */
  static extract(status) {
    const index = status.indexOf(this.MARKER);
    if (index === -1) return null;

    const hidden = status.substring(index + 1);
    const zeroWidthChars = ['\u200B', '\u200C', '\u200D'];

    try {
      let payload = '';
      for (let i = 0; i < hidden.length; i += 8) {
        let byte = '';
        for (let j = 0; j < 8; j++) {
          const char = hidden[i + j];
          byte += char === zeroWidthChars[0] || char === zeroWidthChars[2] ? '0' : '1';
        }
        payload += String.fromCharCode(parseInt(byte, 2));
      }
      return payload;
    } catch {
      return null;
    }
  }
}

/**
 * Steganography Strategy: LSB (Least Significant Bit) in timestamp
 * Encodes payload bits into the microseconds of a timestamp
 */
class TimestampSteganography {
  static LSB_CAPACITY = 16; // 16 bits per timestamp

  /**
   * Encode data in timestamp
   * @param {number} originalTimestamp - Timestamp in milliseconds
   * @param {number} payload - Number to encode (max 65535 for 16 bits)
   * @returns {number} Modified timestamp with embedded data
   */
  static encode(originalTimestamp, payload) {
    if (payload > 65535) throw new Error('Payload exceeds 16-bit capacity');

    // Replace last 16 bits of milliseconds with payload
    const base = originalTimestamp - (originalTimestamp % 65536);
    return base + (payload & 0xFFFF);
  }

  /**
   * Decode data from timestamp
   * @param {number} encodedTimestamp - Timestamp with embedded data
   * @returns {number} Extracted payload
   */
  static decode(encodedTimestamp) {
    return encodedTimestamp & 0xFFFF;
  }

  /**
   * Encode larger payloads across multiple timestamps
   * @param {string} payload - Base64 payload
   * @returns {number[]} Array of encoded timestamps
   */
  static encodeMultiple(payload) {
    const timestamps = [];
    const now = Date.now();

    for (let i = 0; i < payload.length; i++) {
      const charCode = payload.charCodeAt(i);
      // Split each character into 2 timestamps (16 bits each)
      const high = (charCode >> 8) & 0xFF;
      const low = charCode & 0xFF;

      timestamps.push(this.encode(now + i * 1000, high));
      timestamps.push(this.encode(now + i * 1000 + 500, low));
    }

    return timestamps;
  }

  /**
   * Decode larger payloads from multiple timestamps
   * @param {number[]} timestamps - Array of encoded timestamps
   * @returns {string} Extracted payload
   */
  static decodeMultiple(timestamps) {
    let payload = '';

    for (let i = 0; i < timestamps.length; i += 2) {
      const high = this.decode(timestamps[i]);
      const low = this.decode(timestamps[i + 1]);
      const charCode = (high << 8) | low;

      if (charCode > 0) payload += String.fromCharCode(charCode);
    }

    return payload;
  }
}

/**
 * Steganography Strategy: Hide in deviceId metadata
 * Generates a benign-looking device ID that contains encoded data
 */
class DeviceIdSteganography {
  /**
   * Generate device ID with hidden payload
   * @param {string} payload - Payload to hide
   * @returns {string} Device ID containing hidden data
   */
  static generate(payload) {
    // Hash the payload to fit in a fixed space
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    // Format as UUIDv4-like string for plausibility
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(12, 15)}-8${hash.slice(
      15,
      18
    )}-${hash.slice(18, 30)}`;
  }

  /**
   * Verify if device ID contains a specific payload
   * @param {string} deviceId - Device ID to verify
   * @param {string} payload - Payload to verify
   * @returns {boolean} True if payload matches
   */
  static verify(deviceId, payload) {
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    const expected = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(12, 15)}-8${hash.slice(
      15,
      18
    )}-${hash.slice(18, 30)}`;

    return deviceId === expected;
  }
}

/**
 * Steganography Strategy: Carrier Signal
 * Encode payload using a modified version of the original message as carrier
 */
class CarrierSignalSteganography {
  /**
   * Embed encrypted payload in carrier message
   * Alters punctuation/spacing subtly while maintaining readability
   * @param {string} carrierMessage - Original message to use as carrier
   * @param {string} encryptedPayload - Encrypted data to hide
   * @returns {object} { message: string, metadata: object }
   */
  static embed(carrierMessage, encryptedPayload) {
    const hashBuffer = crypto.createHash('sha256').update(encryptedPayload).digest();
    const checksum = hashBuffer.toString('hex').slice(0, 8);

    // Subtle encoding: use different punctuation patterns
    // Pattern 0: "message." (1 space after period)
    // Pattern 1: "message.." (2 spaces or double punctuation)
    const patterns = ['.', '!', '?', '…'];
    let modifiedMessage = carrierMessage;

    // Add steganographic markers at sentence boundaries
    const sentences = carrierMessage.match(/[^.!?…]+[.!?…]+/g) || [carrierMessage];

    let payload = encryptedPayload;
    let sentenceIndex = 0;

    for (const sentence of sentences) {
      if (!payload || sentenceIndex >= sentences.length) break;

      const charCode = payload.charCodeAt(0) % patterns.length;
      const pattern = patterns[charCode];

      // Replace last punctuation with our pattern
      modifiedMessage = modifiedMessage.replace(
        sentence.trim(),
        sentence.replace(/[.!?…]$/, pattern)
      );

      payload = payload.slice(1);
      sentenceIndex++;
    }

    return {
      message: modifiedMessage,
      metadata: {
        checksum,
        payloadSize: encryptedPayload.length,
        sentenceCount: sentences.length,
      },
    };
  }

  /**
   * Extract encrypted payload from carrier message
   * @param {object} carrierData - { message, metadata }
   * @returns {string|null} Extracted payload or null
   */
  static extract(carrierData) {
    // Note: In a real implementation, this would reverse the embedding process
    // This is a simplified version - a full implementation would track the patterns
    return null; // Implement based on your specific embedding logic
  }
}

/**
 * Main Steganography Manager
 */
class SteganographyManager {
  constructor() {
    this.strategies = {
      profile: ProfileSteganography,
      timestamp: TimestampSteganography,
      deviceId: DeviceIdSteganography,
      carrier: CarrierSignalSteganography,
    };
  }

  /**
   * Wrap a message with steganographic encoding
   * Chooses strategy based on payload size and context
   * @param {string} originalMessage - Message visible to user
   * @param {string} encryptedPayload - Encrypted data to hide
   * @param {object} context - { strategy: 'profile' | 'timestamp' | 'deviceId' | 'carrier' }
   * @returns {object} Steganographic package
   */
  wrap(originalMessage, encryptedPayload, context = {}) {
    const strategy = context.strategy || 'profile';

    if (!this.strategies[strategy]) {
      throw new Error(`Unknown steganography strategy: ${strategy}`);
    }

    const handler = this.strategies[strategy];
    const timestamp = Date.now();

    let wrapped;
    switch (strategy) {
      case 'profile':
        wrapped = handler.embed(originalMessage, encryptedPayload);
        break;
      case 'timestamp':
        wrapped = handler.encodeMultiple(encryptedPayload);
        break;
      case 'carrier':
        wrapped = handler.embed(originalMessage, encryptedPayload);
        break;
      default:
        wrapped = originalMessage;
    }

    return {
      strategy,
      wrapped,
      timestamp,
      checksum: crypto.createHash('md5').update(encryptedPayload).digest('hex').slice(0, 8),
    };
  }

  /**
   * Unwrap a steganographic package
   * @param {object} package - Steganographic package
   * @param {string} wrappedData - Wrapped data to extract from
   * @returns {string|null} Extracted encrypted payload
   */
  unwrap(pkg, wrappedData) {
    const strategy = pkg.strategy;
    const handler = this.strategies[strategy];

    if (!handler) return null;

    try {
      switch (strategy) {
        case 'profile':
          return handler.extract(wrappedData);
        case 'timestamp':
          return handler.decodeMultiple(wrappedData);
        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  /**
   * Randomly select a steganography strategy
   * @returns {string} Strategy name
   */
  randomStrategy() {
    const strategies = Object.keys(this.strategies);
    return strategies[Math.floor(Math.random() * strategies.length)];
  }
}

module.exports = {
  ProfileSteganography,
  TimestampSteganography,
  DeviceIdSteganography,
  CarrierSignalSteganography,
  SteganographyManager,
};
